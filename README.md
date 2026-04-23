🚀 XcelCrowd: Autonomous Next-In-Line ATSA Hiring Pipeline That Moves Itself.XcelCrowd is an automated recruitment engine designed to eliminate the manual overhead of queue management. Built with a "Self-Healing" philosophy, the system ensures that when a spot opens up, the next best candidate is promoted instantly, maintaining a fluid, transparent, and fair hiring experience.🛠 Tech Stack (PERN)Frontend: React.js (Vite) — Optimized for real-time state synchronization.Backend: Node.js & Express — Designed with modular, atomic service layers.Database: PostgreSQL — Utilizing advanced Row-Level Locking for industrial-grade concurrency.UI/UX: Lucide-React & Tailwind-styled CSS — For high-fidelity visual auditing.API Client: Axios — With centralized error handling.🏗 Key Features & Architectural Highlights1️⃣ Role-Based Multi-Portal InterfaceXcelCrowd provides distinct, decoupled entry points:Candidate Portal (/candidate): Direct transparency into queue positions and promotion acknowledgment.Recruiter Dashboard (/recruiter): A command center for auditing the pipeline and triggering the promotion cascade.2️⃣ Gapless "Self-Healing" Queue (Re-indexing Algorithm)Unlike static lists, XcelCrowd corrects its own numbering. If any candidate is rejected or removed, a recursive re-indexing function fires immediately to ensure the waitlist remains a perfect sequence (1, 2, 3...) without "ghost positions" or fragmentation.3️⃣ Atomic Concurrency & The "Last Spot" HandshakeDesigned for high-traffic spikes, the backend prevents "Race Conditions." When two users apply at the same millisecond for one final spot, the system uses PostgreSQL Transactions to referee the entry, ensuring only one becomes ACTIVE while the other is accurately queued.⚙️ Core Logic & Requirements Fulfillment (Audit-Ready)RequirementTechnical Implementation1. Defined CapacityManaged via active_capacity parameters in the jobs relational schema.2. Waitlist logicAutomated status assignment prevents premature rejections.3. Auto-PromotionChain-reaction logic triggered by ACTIVE candidate exit or rejection.4. Status CheckReal-time GET requests to retrieve position and acknowledged status.5. ConcurrencyImplemented via BEGIN/COMMIT and SELECT ... FOR UPDATE locking.6. TraceabilityEvery state transition is recorded in pipeline_logs for historical reconstruction.7. Inactivity Decay24-hour decay window with Penalized Repositioning (MAX(pos) + 1).🚦 Local Setup & InstallationTo run XcelCrowd on your local machine, follow these steps exactly:1. Clone the RepositoryBashgit clone https://github.com/Vishn-vardhan-raju/xcel-crowd-ats.git
cd xcel-crowd-ats 2. Database Setup (PostgreSQL)Create a database named recruitment_db and run the following schema:SQLCREATE TABLE jobs (id SERIAL PRIMARY KEY, active_capacity INT);
INSERT INTO jobs (id, active_capacity) VALUES (6, 3); -- Default test job

CREATE TABLE applicants (
id SERIAL PRIMARY KEY,
job_id INT REFERENCES jobs(id),
name TEXT,
email TEXT UNIQUE,
status TEXT, -- 'ACTIVE', 'WAITLISTED', 'REJECTED'
queue_position INT,
acknowledged BOOLEAN DEFAULT FALSE,
promoted_at TIMESTAMP
);

CREATE TABLE pipeline_logs (
id SERIAL PRIMARY KEY,
applicant_id INT,
action_type TEXT,
details TEXT,
created_at TIMESTAMP DEFAULT NOW()
); 3. Backend ConfigurationBashcd backend
npm install express pg cors dotenv

# Create a .env file

echo "DATABASE_URL=postgres://your_user:your_password@localhost:5432/recruitment_db" > .env
node server.js 4. Frontend ConfigurationBashcd ../frontend
npm install react-router-dom lucide-react axios
npm run dev
Open http://localhost:5173/candidate in your browser.🧠 AI Collaboration & Refinement (XVal Dimension)This project was developed through a rigorous iterative process with AI assistance.Customization: AI was used to generate initial boilerplate, which was then manually refitted with PostgreSQL Transactions to handle specific race conditions.Error Handling: We utilized AI to audit the reindexQueue function, ensuring that gaps were filled even when multiple waitlisted users were removed simultaneously.Logic Refinement: The Inactivity Decay logic was evolved from simple deletion to a Penalized Swap system through collaborative brainstorming with AI.
