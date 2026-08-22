# System Design — Society Maintenance Tracker

## 1. Complaint History Model

The complaint lifecycle is the core of this application. Rather than storing only the current status, each complaint maintains both a `status` field for quick reads and a `history` array that records every transition.

When a resident submits a complaint, the system sets `status` to `OPEN` and pushes the first history entry: who submitted it, the status, a note ("Complaint submitted"), and a timestamp. When an admin changes status to `IN_PROGRESS` or `RESOLVED`, the backend updates the top-level `status` and appends a new object to `history` with the admin's ID, optional note, and timestamp.

This design satisfies audit requirements: residents see a full timeline on the complaint detail page, and evaluators can verify that no change was lost. The `changedBy` field references the User collection, so the UI can show whether the resident or admin made each change. Resolved complaints set `isClosed` to true and block further status updates, keeping the history immutable after closure.

Storing history as an embedded array inside the Complaint document keeps reads simple—a single query returns the complaint and its full timeline. For a society-scale app with hundreds of complaints, this remains efficient because each complaint typically has only a handful of status changes.

## 2. Overdue Detection

Overdue complaints are not modeled as a separate status. Instead, the system uses a boolean `isOverdue` flag combined with the existing `OPEN` or `IN_PROGRESS` status. The threshold is configurable via `OVERDUE_DAYS` in the environment (default: 3 days).

Detection logic compares `createdAt` against the current date minus the threshold. If a complaint is unresolved (`status` is not `RESOLVED`, `isClosed` is false) and `createdAt` is older than the cutoff, it is marked overdue. A utility function `syncOverdueFlags` runs before admin list and dashboard requests to batch-update flags in MongoDB, ensuring the database stays consistent with the configured threshold.

The admin complaint list sorts by `isOverdue` descending first, so overdue items surface at the top. The dashboard counts overdue complaints separately for the stats card. When an admin resolves a complaint, `isOverdue` is cleared immediately. This approach avoids a redundant `OVERDUE` status while still giving admins clear visibility into stalled work.

## 3. Photo Handling

Photos are optional attachments on complaints. The system never stores binary image data in MongoDB or the Git repository. Instead, the upload flow is: resident selects a file in the frontend, the backend receives it via Multer (memory storage, 5MB limit, images only), uploads the buffer to Cloudinary, and stores only the returned HTTPS URL in the `photoUrl` field.

Cloudinary handles resizing, CDN delivery, and storage. This keeps the backend stateless regarding files and the repository small. If Cloudinary credentials are missing, complaint creation without a photo still works; attempts to upload a photo return a clear configuration error. The frontend can display images by rendering the stored URL directly.

## 4. Notification Flow

Email notifications use Resend, a transactional email API with a free tier suitable for assignments and small deployments. Two events trigger emails.

**Status change:** When an admin updates a complaint status via `PUT /api/complaints/:id/status`, the controller saves the change and history entry, then calls a notification helper. The helper loads the resident's email from the populated complaint, formats the new status and optional note into an HTML email, and sends via Resend. Failures are logged but do not block the API response—the status update succeeds even if email delivery fails.

**Important notice:** When an admin creates a notice with `isImportant: true`, the system fetches all users with role `resident` and sends each a broadcast email with the notice title and description. General notices do not trigger email, reducing noise.

Both flows check for `EMAIL_API_KEY` before sending. If unconfigured, the server logs a skip message and continues. This allows local development without email setup while keeping production-ready integration in place.

---

**Architecture summary:** React frontend → Express REST API → MongoDB Atlas, with Cloudinary for photos and Resend for email. JWT authentication enforces role-based access on every protected route.
