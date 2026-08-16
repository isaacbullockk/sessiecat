const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /const \[artists, setArtists\] = useState<Artist\[\]>\(\(\) => \{[\s\S]*?\}\);/,
  `const [artists, setArtists] = useState<Artist[]>([]);
  useEffect(() => {
    if (!googleUser && route.base !== 'claim') return;
    const unsubscribe = onSnapshot(collection(db, 'artists'), async (snapshot) => {
      try {
        if (snapshot.empty) {
          const batch = writeBatch(db);
          INITIAL_ARTISTS.forEach(a => batch.set(doc(db, 'artists', a.id), a));
          await batch.commit();
          setArtists(INITIAL_ARTISTS);
        } else {
          setArtists(snapshot.docs.map(d => ({ ...d.data() }) as Artist));
        }
      } catch(err) { console.error(err); }
    });
    return () => unsubscribe();
  }, [googleUser, route.base]);`
);

content = content.replace(
  /const \[gigs, setGigs\] = useState<Gig\[\]>\(\(\) => \{[\s\S]*?\}\);/,
  `const [gigs, setGigs] = useState<Gig[]>([]);
  useEffect(() => {
    if (!googleUser && route.base !== 'claim') return;
    const unsubscribe = onSnapshot(collection(db, 'gigs'), async (snapshot) => {
      try {
        if (snapshot.empty) {
          const batch = writeBatch(db);
          INITIAL_GIGS.forEach(g => batch.set(doc(db, 'gigs', g.id), g));
          await batch.commit();
          setGigs(INITIAL_GIGS);
        } else {
          setGigs(snapshot.docs.map(d => ({ ...d.data() }) as Gig));
        }
      } catch(err) { console.error(err); }
    });
    return () => unsubscribe();
  }, [googleUser, route.base]);`
);

content = content.replace(
  /const \[bookings, setBookings\] = useState<Booking\[\]>\(\(\) => \{[\s\S]*?\}\);/,
  `const [bookings, setBookings] = useState<Booking[]>([]);
  useEffect(() => {
    if (!googleUser && route.base !== 'claim') return;
    const unsubscribe = onSnapshot(collection(db, 'bookings'), async (snapshot) => {
      try {
        if (snapshot.empty) {
          const batch = writeBatch(db);
          INITIAL_BOOKINGS.forEach(b => batch.set(doc(db, 'bookings', b.id), b));
          await batch.commit();
          setBookings(INITIAL_BOOKINGS);
        } else {
          setBookings(snapshot.docs.map(d => ({ ...d.data() }) as Booking));
        }
      } catch(err) { console.error(err); }
    });
    return () => unsubscribe();
  }, [googleUser, route.base]);`
);

content = content.replace(/useEffect\(\(\) => \{\s*localStorage\.setItem\('sessiecat_artists', JSON\.stringify\(artists\)\);\s*\}, \[artists\]\);\n/g, '');
content = content.replace(/useEffect\(\(\) => \{\s*localStorage\.setItem\('sessiecat_gigs', JSON\.stringify\(gigs\)\);\s*\}, \[gigs\]\);\n/g, '');
content = content.replace(/useEffect\(\(\) => \{\s*localStorage\.setItem\('sessiecat_bookings', JSON\.stringify\(bookings\)\);\s*\}, \[bookings\]\);\n/g, '');
content = content.replace(/useEffect\(\(\) => \{\s*localStorage\.setItem\('sessiecat_tours', JSON\.stringify\(tours\)\);\s*\}, \[tours\]\);\n/g, '');
content = content.replace(/useEffect\(\(\) => \{\s*localStorage\.setItem\('sessiecat_favorites', JSON\.stringify\(favoriteArtistIds\)\);\s*\}, \[favoriteArtistIds\]\);\n/g, '');
content = content.replace(/useEffect\(\(\) => \{\s*localStorage\.setItem\('sessiecat_client_reviews', JSON\.stringify\(clientReviews\)\);\s*\}, \[clientReviews\]\);\n/g, '');

content = content.replace(/const handleCreateBooking = \(b: Booking\) => \{\s*setBookings\(\(prev\) => \[b, \.\.\.prev\]\);\s*\};/g, `const handleCreateBooking = async (b: Booking) => {
    try {
      await setDoc(doc(db, 'bookings', b.id), b);
      setBookings((prev) => [b, ...prev]);
    } catch(err) { console.error(err); }
  };`);

content = content.replace(/const handleCreateGig = \(gig: Gig\) => \{\s*setGigs\(\(prev\) => \[gig, \.\.\.prev\]\);\s*\};/g, `const handleCreateGig = async (gig: Gig) => {
    try {
      await setDoc(doc(db, 'gigs', gig.id), gig);
      setGigs((prev) => [gig, ...prev]);
    } catch(err) { console.error(err); }
  };`);

content = content.replace(/const handleApplyGig = \(gigId: string\) => \{(\s*setGigs\(\(prev\) =>\s*prev\.map\(\(g\) =>\s*g\.id === gigId \? \{ \.\.\.g, status: 'Applied' \} : g\s*\)\s*\);\s*)\};/g, `const handleApplyGig = async (gigId: string) => {
    try {
      await updateDoc(doc(db, 'gigs', gigId), { status: 'Applied' });
      setGigs((prev) =>
        prev.map((g) =>
          g.id === gigId ? { ...g, status: 'Applied' } : g
        )
      );
    } catch(err) { console.error(err); }
  };`);

fs.writeFileSync('src/App.tsx', content);
