import { StudentRecordDetail } from "../types/students";

export const MOCK_STUDENTS: StudentRecordDetail[] = [
  {
    id: "STU-001",
    apaarId: "9823-4412-9011",
    institutionStudentId: "COEP/2026/CS/042",
    fullName: "Aarav Sharma",
    institutionCode: "1-332901124",
    institutionName: "College of Engineering, Pune (COEP)",
    state: "Maharashtra",
    programme: "Computer Science & Engineering",
    degreeLevel: "Undergraduate (B.Tech)",
    academicYear: "2026-27",
    admissionDate: "2026-08-14",
    approvedIntakeReference: "AICTE/2026/COEP/CS-240",
    admissionCategory: "General / Open",
    supernumeraryCategory: "None",
    isNri: false,
    isOci: false,
    isForeignNational: false,
    enrolmentStatus: "Active Enrolment",
    validationStatus: "Verified",
    lastUpdated: "2026-10-29T08:35:00Z",
    integrityHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    auditTrail: [
      {
        event: "APAAR Token Sealed via Digilocker Gateway",
        timestamp: "2026-10-29T08:35:10Z",
        actor: "COEP Nodal Officer",
      },
      {
        event: "Initial Batch Enrollment Ingestion",
        timestamp: "2026-08-20T10:15:00Z",
        actor: "State CET Cell System",
      },
    ],
  },
  {
    id: "STU-002",
    apaarId: "4810-7721-3490",
    institutionStudentId: "PSG/2026/CSE/108",
    fullName: "Priya Sundaram",
    institutionCode: "1-558291023",
    institutionName: "PSG College of Technology, Coimbatore",
    state: "Tamil Nadu",
    programme: "Computer Science & Engineering",
    degreeLevel: "Undergraduate (B.Tech)",
    academicYear: "2026-27",
    admissionDate: "2026-08-16",
    approvedIntakeReference: "AICTE/2026/PSG/CS-240",
    admissionCategory: "OBC-NCL",
    supernumeraryCategory: "Tuition Fee Waiver (TFW 5%)",
    isNri: false,
    isOci: false,
    isForeignNational: false,
    enrolmentStatus: "Active Enrolment",
    validationStatus: "Verified",
    lastUpdated: "2026-10-29T07:45:10Z",
    integrityHash: "88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936ffc0650",
    auditTrail: [
      {
        event: "TFW Quota Allotment Endorsed",
        timestamp: "2026-10-29T07:45:15Z",
        actor: "Tamil Nadu DOTE Node",
      },
    ],
  },
  {
    id: "STU-003",
    apaarId: "3312-8901-2244",
    institutionStudentId: "DTU/2026/ME/214",
    fullName: "Rohan Mukherjee",
    institutionCode: "1-882910344",
    institutionName: "Delhi Technological University (DTU)",
    state: "Delhi",
    programme: "Mechanical Engineering",
    degreeLevel: "Undergraduate (B.Tech)",
    academicYear: "2026-27",
    admissionDate: "2026-08-12",
    approvedIntakeReference: "AICTE/2026/DTU/ME-400",
    admissionCategory: "General / Open",
    supernumeraryCategory: "None",
    isNri: false,
    isOci: false,
    isForeignNational: false,
    enrolmentStatus: "Active Enrolment",
    validationStatus: "Pending Validation",
    lastUpdated: "2026-10-29T06:30:00Z",
    integrityHash: "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
    auditTrail: [
      {
        event: "Nodal Officer Signature Pending",
        timestamp: "2026-10-29T06:30:00Z",
        actor: "DTU Academic Registrar",
      },
    ],
  },
  {
    id: "STU-004",
    apaarId: "7721-1109-8832",
    institutionStudentId: "IET/2026/EE/076",
    fullName: "Kavita Verma",
    institutionCode: "1-772910291",
    institutionName: "Institute of Engineering & Tech, Lucknow",
    state: "Uttar Pradesh",
    programme: "Electrical Engineering",
    degreeLevel: "Undergraduate (B.Tech)",
    academicYear: "2026-27",
    admissionDate: "2026-08-18",
    approvedIntakeReference: "AICTE/2026/IET/EE-60",
    admissionCategory: "SC",
    supernumeraryCategory: "None",
    isNri: false,
    isOci: false,
    isForeignNational: false,
    enrolmentStatus: "Active Enrolment",
    validationStatus: "Flagged Duplicate",
    lastUpdated: "2026-10-29T05:12:45Z",
    integrityHash: "d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
    auditTrail: [
      {
        event: "Discrepancy: Active Dual Admission Flagged against HBTU Kanpur",
        timestamp: "2026-10-29T05:12:45Z",
        actor: "AICTE Heuristic Detection Service",
      },
    ],
  },
  {
    id: "STU-005",
    apaarId: "6612-3390-1178",
    institutionStudentId: "NIE/2026/CS/088",
    fullName: "Manoj Gowda",
    institutionCode: "1-449102871",
    institutionName: "National Institute of Engineering, Mysuru",
    state: "Karnataka",
    programme: "Computer Science & Engineering",
    degreeLevel: "Undergraduate (B.Tech)",
    academicYear: "2026-27",
    admissionDate: "2026-08-10",
    approvedIntakeReference: "AICTE/2026/NIE/CS-240",
    admissionCategory: "OBC-NCL",
    supernumeraryCategory: "None",
    isNri: false,
    isOci: false,
    isForeignNational: false,
    enrolmentStatus: "Active Enrolment",
    validationStatus: "Verified",
    lastUpdated: "2026-10-29T04:20:00Z",
    integrityHash: "3c98aa201bfde849201ef370129bcfe37829103cba74839201823901bc374829",
    auditTrail: [
      {
        event: "KEA State Counseling Seat Allotment Reconciled",
        timestamp: "2026-10-29T04:20:00Z",
        actor: "NIE Admissions Office",
      },
    ],
  },
  {
    id: "STU-006",
    apaarId: "5510-9944-2231",
    institutionStudentId: "DTU/2026/CE/482",
    fullName: "Sameer Taneja",
    institutionCode: "1-882910344",
    institutionName: "Delhi Technological University (DTU)",
    state: "Delhi",
    programme: "Computer Engineering",
    degreeLevel: "Undergraduate (B.Tech)",
    academicYear: "2026-27",
    admissionDate: "2026-08-25",
    approvedIntakeReference: "AICTE/2026/DTU/CE-480",
    admissionCategory: "EWS",
    supernumeraryCategory: "EWS (10%)",
    isNri: false,
    isOci: false,
    isForeignNational: false,
    enrolmentStatus: "Active Enrolment",
    validationStatus: "Intake Over-Quota",
    lastUpdated: "2026-10-29T03:50:00Z",
    integrityHash: "1948201fa8721903be718902ca83910284729103cba928102839102847192837",
    auditTrail: [
      {
        event: "Intake Quota Threshold Audit Alert Triggered",
        timestamp: "2026-10-29T03:50:00Z",
        actor: "AICTE Regulatory Engine",
      },
    ],
  },
  {
    id: "STU-007",
    apaarId: "4421-8833-0092",
    institutionStudentId: "LDCE/2026/CH/034",
    fullName: "Diya Parikh",
    institutionCode: "1-662910488",
    institutionName: "L.D. College of Engineering, Ahmedabad",
    state: "Gujarat",
    programme: "Chemical Engineering",
    degreeLevel: "Undergraduate (B.Tech)",
    academicYear: "2026-27",
    admissionDate: "2026-08-11",
    approvedIntakeReference: "AICTE/2026/LDCE/CH-180",
    admissionCategory: "General / Open",
    supernumeraryCategory: "Tuition Fee Waiver (TFW 5%)",
    isNri: false,
    isOci: false,
    isForeignNational: false,
    enrolmentStatus: "Active Enrolment",
    validationStatus: "Verified",
    lastUpdated: "2026-10-28T14:15:00Z",
    integrityHash: "9021847201849201ba83910284729103cba9281028391028471928371948201f",
    auditTrail: [
      {
        event: "ACPC Gujarat State Admission Reconciled",
        timestamp: "2026-10-28T14:15:00Z",
        actor: "LDCE Registrar",
      },
    ],
  },
  {
    id: "STU-008",
    apaarId: "2209-6611-7788",
    institutionStudentId: "JU/2026/IT/051",
    fullName: "Arka Bhattacharya",
    institutionCode: "1-992910512",
    institutionName: "Jadavpur University Faculty of Engg, Kolkata",
    state: "West Bengal",
    programme: "Information Technology",
    degreeLevel: "Undergraduate (B.Tech)",
    academicYear: "2026-27",
    admissionDate: "2026-08-13",
    approvedIntakeReference: "AICTE/2026/JU/IT-60",
    admissionCategory: "General / Open",
    supernumeraryCategory: "None",
    isNri: false,
    isOci: false,
    isForeignNational: false,
    enrolmentStatus: "Active Enrolment",
    validationStatus: "Verified",
    lastUpdated: "2026-10-28T10:00:00Z",
    integrityHash: "71928371948201fa8721903be718902ca83910284729103cba92810283910284",
    auditTrail: [
      {
        event: "WBJEE Centralized Verification Successful",
        timestamp: "2026-10-28T10:00:00Z",
        actor: "Jadavpur University Admissions",
      },
    ],
  },
];

// Deterministic Pseudo-Random Generator for repeatable seed
let seed = 42;
function pseudoRandom() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

const FIRST_NAMES = [
  "Aarav", "Aditi", "Aditya", "Akash", "Ananya", "Aniket", "Ankita", "Arjun",
  "Deepak", "Divya", "Gaurav", "Harsh", "Isha", "Ishaan", "Karan", "Kavya",
  "Manish", "Meera", "Naveen", "Neha", "Nikhil", "Pooja", "Pranav", "Priya",
  "Rahul", "Riya", "Rohan", "Sakshi", "Sameer", "Sanjay", "Shreya", "Siddharth",
  "Sneha", "Tanvi", "Utkarsh", "Varun", "Vikram", "Yash", "Zainab", "Arnav"
];

const LAST_NAMES = [
  "Sharma", "Verma", "Patel", "Joshi", "Iyer", "Nair", "Rao", "Gupta",
  "Deshmukh", "Kulkarni", "Choudhury", "Bose", "Banerjee", "Sengupta", "Reddy",
  "Bhat", "Mehta", "Singh", "Aggarwal", "Kapoor", "Mishra", "Pandey", "Ghosh",
  "Chakraborty", "Menon", "Pillai", "Nambiar", "Swaminathan", "Venkatesh"
];

const INSTITUTION_PRESETS = [
  { code: "1-332901124", name: "College of Engineering, Pune (COEP)", state: "Maharashtra", alias: "COEP", prog: "Computer Science & Engineering" },
  { code: "1-482910441", name: "Veermata Jijabai Technological Institute (VJTI), Mumbai", state: "Maharashtra", alias: "VJTI", prog: "Computer Engineering" },
  { code: "1-772910382", name: "RV College of Engineering (RVCE), Bengaluru", state: "Karnataka", alias: "RVCE", prog: "Computer Science & Engineering" },
  { code: "1-552910891", name: "BMS College of Engineering (BMSCE), Bengaluru", state: "Karnataka", alias: "BMSCE", prog: "Computer Science & Engineering" },
  { code: "1-882910344", name: "Delhi Technological University (DTU)", state: "Delhi", alias: "DTU", prog: "Information Technology" },
  { code: "1-882910129", name: "Netaji Subhas University of Technology (NSUT), Delhi", state: "Delhi", alias: "NSUT", prog: "Computer Engineering" },
  { code: "1-558291023", name: "PSG College of Technology, Coimbatore", state: "Tamil Nadu", alias: "PSG", prog: "Computer Science & Engineering" },
  { code: "1-112910443", name: "Thiagarajar College of Engineering, Madurai", state: "Tamil Nadu", alias: "TCE", prog: "Mechanical Engineering" },
  { code: "1-449102871", name: "National Institute of Engineering, Mysuru", state: "Karnataka", alias: "NIE", prog: "Civil Engineering" },
  { code: "1-772910291", name: "Institute of Engineering & Tech, Lucknow", state: "Uttar Pradesh", alias: "IET", prog: "Electronics & Communication Engg" },
  { code: "1-442910118", name: "L.D. College of Engineering, Ahmedabad", state: "Gujarat", alias: "LDCE", prog: "Chemical Engineering" },
  { code: "1-992910512", name: "Jadavpur University Faculty of Engg, Kolkata", state: "West Bengal", alias: "JU", prog: "Computer Science & Engineering" },
];

const CATEGORIES: ("General / Open" | "OBC-NCL" | "SC" | "ST" | "EWS")[] = [
  "General / Open", "General / Open", "General / Open", "OBC-NCL", "OBC-NCL", "SC", "ST", "EWS"
];

// Generate exactly 992 synthetic deterministic records to reach 1,000 total records
for (let i = 9; i <= 1000; i++) {
  const fName = FIRST_NAMES[Math.floor(pseudoRandom() * FIRST_NAMES.length)];
  const lName = LAST_NAMES[Math.floor(pseudoRandom() * LAST_NAMES.length)];
  const inst = INSTITUTION_PRESETS[Math.floor(pseudoRandom() * INSTITUTION_PRESETS.length)] || INSTITUTION_PRESETS[0]!;
  const cat = CATEGORIES[Math.floor(pseudoRandom() * CATEGORIES.length)] || "General / Open";

  const num1 = String(1000 + Math.floor(pseudoRandom() * 9000));
  const num2 = String(1000 + Math.floor(pseudoRandom() * 9000));
  const num3 = String(1000 + Math.floor(pseudoRandom() * 9000));
  const apaar = `${num1}-${num2}-${num3}`;

  const yearRand = pseudoRandom();
  const year = yearRand > 0.35 ? "2026-27" : yearRand > 0.15 ? "2025-26" : "2024-25";

  const statusRand = pseudoRandom();
  const valStatus =
    statusRand > 0.12
      ? "Verified"
      : statusRand > 0.06
      ? "Pending Validation"
      : statusRand > 0.03
      ? "Flagged Duplicate"
      : statusRand > 0.015
      ? "Intake Over-Quota"
      : "Format Error";

  MOCK_STUDENTS.push({
    id: `STU-${String(i).padStart(4, "0")}`,
    apaarId: apaar,
    institutionStudentId: `${inst.alias}/${year.slice(0, 4)}/ENG/${String(i).padStart(3, "0")}`,
    fullName: `${fName} ${lName}`,
    institutionCode: inst.code,
    institutionName: inst.name,
    state: inst.state,
    programme: inst.prog,
    degreeLevel: "Undergraduate (B.Tech)",
    academicYear: year,
    admissionDate: `2026-08-${String(10 + (i % 18)).padStart(2, "0")}`,
    approvedIntakeReference: `AICTE/${year.slice(0, 4)}/${inst.alias}/ENG-240`,
    admissionCategory: cat,
    supernumeraryCategory: i % 15 === 0 ? "Tuition Fee Waiver (TFW 5%)" : i % 25 === 0 ? "EWS (10%)" : "None",
    isNri: false,
    isOci: false,
    isForeignNational: false,
    enrolmentStatus: "Active Enrolment",
    validationStatus: valStatus,
    lastUpdated: "2026-10-28T12:00:00Z",
    integrityHash: `sha256-${((seed * 99991) >>> 0).toString(16).padStart(8, "0")}${(i * 12345).toString(16)}`,
    auditTrail: [
      {
        event: "Batch Enrollment Record Registered",
        timestamp: "2026-08-20T10:00:00Z",
        actor: `${inst.alias} Nodal Officer`,
      },
    ],
  });
}
