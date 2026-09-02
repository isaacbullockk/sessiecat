# Security Specifications for Sessiecat Firebase Collections

This specification defines the strict zero-trust parameters and relational constraints enforced across all Firestore collections.

## 1. Data Invariants

- **Users**: A user document must match the authenticating UID and cannot change their own roles to escalate privileges.
- **Tours**: Only tour owners (managers) can create and update a tour. Requirements budget metrics must validate.
- **Events**: Only organizers can create or update event logs.
- **Musicians**: Profile data must be locked down; only the musician owning the document can update their own rate cards or tags.
- **Holds**: Only the manager or event owner who created the hold can update it, and rates cannot be altered post-lock. Expired holds prevent any transition to 'confirmed'.
- **Conversations**: Users must be part of the thread context (derived from tourId or direct participant IDs) to write or read thread entries.

## 2. The "Dirty Dozen" Vulnerability Payloads

1. **Self-Escalation**: Authenticated user trying to write `role: 'manager'` into someone else's profile.
2. **Ghost Field Injection**: Adding an unvetted `isVerified: true` claim to an unauthorized musician profile.
3. **Budget Poisoning**: Modifying a tour's `budgetShow` to a negative number or extremely large value to corrupt budget calculations.
4. **Hold Rate Hijack**: An unassigned musician attempting to approve their own custom rate on a locked hold.
5. **ID Path Injection**: Injecting a 1MB junk ID string like `/holds/junkxxxx...` to attempt a Denial of Wallet attack.
6. **Self-Rating Booster**: A musician trying to issue verified review documents to increase their own `ratingCount` or `avgRating`.
7. **Thread Hijack**: Authenticated user trying to poll or read private escrow messages of another band's thread.
8. **Time Spoofing**: Submitting a pre-dated `createdAt` timestamp to override hold terms.
9. **Orphaned Slot Creation**: Creating an availability slot under a non-existent musician ID.
10. **Terminal Hold Unlock**: Transitioning a hold from `declined` or `expired` straight into `confirmed` without renegotiation.
11. **Client-Side Claim Spoofing**: Attempting a list query on all active bids without enforcing `resource.data.createdBy` constraints.
12. **PII Scraping**: Attempting a blanket query to scrape emails of all registered users without isOwner or isAdmin checking.

## 3. Core Fortress Rules Design

Below we draft the fortress rules protecting these vectors.
