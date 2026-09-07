// Test mode utilities
export function isTestMode(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("test");
}

export const MOCK_APPLICATIONS_MD = `# Applications

| #   | Date       | Company     | Role              | Score | Status    | PDF                      | Report                                      | Notes               |
| --- | ---------- | ----------- | ----------------- | ----- | --------- | ------------------------ | ------------------------------------------- | ------------------- |
| 1   | 2026-01-15 | Acme Corp   | Backend Engineer  | 4.2   | Applied   | [cv](output/acme.pdf)    | [report](reports/001-acme-2026-01-15.md)    | Strong fit          |
| 2   | 2026-02-03 | Example Inc | Platform Engineer | 3.8   | Interview | [cv](output/example.pdf) | [report](reports/002-example-2026-02-03.md) | Phone screen booked |
| 3   | 2026-02-10 | Tech Startup| Frontend Dev      | 4.5   | Offer     | [cv](output/tech.pdf)    | [report](reports/003-tech-2026-02-10.md)    | Great opportunity   |
| 4   | 2026-02-15 | BigCo       | Full Stack        | 3.2   | Rejected  | [cv](output/bigco.pdf)   | [report](reports/004-bigco-2026-02-15.md)   | Not a fit           |
| 5   | 2026-02-20 | StartupXYZ  | DevOps Engineer   | 4.0   | Applied   | [cv](output/xyz.pdf)     | [report](reports/005-xyz-2026-02-20.md)     | Interesting role    |`;

export const MOCK_PIPELINE_MD = `# Pipeline

- Applied
- Interview
- Offer
- Rejected`;
