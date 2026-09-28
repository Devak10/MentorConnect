/**
 * MentorConnect - Frontend Script
 * Plain Vanilla JavaScript with Fetch API & DOM Manipulation
 */

const API_BASE_URL = "http://localhost:8080";

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initForms();
    initRefreshButtons();

    // Initial data load
    updateDashboardCounts();
    loadAlumni();
    loadStudents();
    loadMentorshipDropdowns();
    loadMentorships();
    loadSessionMentorshipDropdown();
    loadSessions();
});

// ==========================================================================
// Navigation & Tab Switching
// ==========================================================================
function initNavigation() {
    const navTabs = document.querySelectorAll(".nav-tab");
    navTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const target = tab.getAttribute("data-target");
            switchSection(target);
        });
    });

    // Jump links (e.g. from stat cards or quick action buttons)
    document.querySelectorAll("[data-jump]").forEach(el => {
        el.addEventListener("click", () => {
            const target = el.getAttribute("data-jump");
            switchSection(target);
        });
    });
}

function switchSection(targetSectionId) {
    // Update nav tabs
    document.querySelectorAll(".nav-tab").forEach(tab => {
        if (tab.getAttribute("data-target") === targetSectionId) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });

    // Update section visibility
    document.querySelectorAll(".content-section").forEach(sec => {
        sec.classList.remove("active");
    });

    const targetSec = document.getElementById(`section-${targetSectionId}`);
    if (targetSec) {
        targetSec.classList.add("active");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Refresh data when navigating into a section
    if (targetSectionId === "dashboard") {
        updateDashboardCounts();
    } else if (targetSectionId === "alumni") {
        loadAlumni();
    } else if (targetSectionId === "students") {
        loadStudents();
    } else if (targetSectionId === "mentorships") {
        loadMentorshipDropdowns();
        loadMentorships();
    } else if (targetSectionId === "sessions") {
        loadSessions();
    }
}

// ==========================================================================
// Reusable API Client Helper
// ==========================================================================
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...(options.headers || {})
            }
        });

        // 204 No Content
        if (response.status === 204) {
            return { success: true, data: null, status: 204 };
        }

        let body = null;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            body = await response.json();
        } else {
            const text = await response.text();
            body = text ? { message: text } : null;
        }

        if (!response.ok) {
            let errorMessage = "Something went wrong on the server.";
            if (response.status === 404) {
                errorMessage = "Requested record was not found.";
            } else if (response.status === 400) {
                if (body && body.message && body.message.includes("maximum mentee capacity")) {
                    errorMessage = "This mentor has reached the maximum mentee capacity.";
                } else if (body && body.message) {
                    errorMessage = body.message;
                } else {
                    errorMessage = "Invalid request. Please check the supplied inputs.";
                }
            } else if (response.status === 500) {
                errorMessage = "Something went wrong on the server.";
            } else if (body && body.message) {
                errorMessage = body.message;
            }

            return {
                success: false,
                status: response.status,
                error: errorMessage,
                raw: body
            };
        }

        setBackendStatus(true);
        return { success: true, data: body, status: response.status };

    } catch (networkError) {
        console.error("Network or fetch error:", networkError);
        setBackendStatus(false);
        return {
            success: false,
            status: 0,
            error: "Unable to connect to the backend. Make sure Spring Boot is running."
        };
    }
}

function setBackendStatus(online) {
    const badge = document.getElementById("backend-status-badge");
    const text = document.getElementById("backend-status-text");
    if (!badge || !text) return;
    if (online) {
        badge.classList.remove("offline");
        text.textContent = "Backend Connected";
    } else {
        badge.classList.add("offline");
        text.textContent = "Backend Offline";
    }
}

// ==========================================================================
// Toast Notification System
// ==========================================================================
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    const textSpan = document.createElement("span");
    textSpan.textContent = message;

    const closeBtn = document.createElement("button");
    closeBtn.className = "toast-close";
    closeBtn.innerHTML = "&times;";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.onclick = () => removeToast(toast);

    toast.appendChild(textSpan);
    toast.appendChild(closeBtn);
    container.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        removeToast(toast);
    }, 4000);
}

function removeToast(toast) {
    if (toast && toast.parentElement) {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-8px)";
        setTimeout(() => toast.remove(), 200);
    }
}

// ==========================================================================
// Validation Helpers (Inline Errors)
// ==========================================================================
function clearFieldError(inputEl, errorEl) {
    if (inputEl) inputEl.classList.remove("input-error");
    if (errorEl) {
        errorEl.textContent = "";
        errorEl.classList.remove("active");
    }
}

function setFieldError(inputEl, errorEl, message) {
    if (inputEl) inputEl.classList.add("input-error");
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add("active");
    }
}

function validateName(val, inputEl, errorEl) {
    const raw = (val !== undefined && val !== null) ? String(val) : "";
    if (raw.length === 0 || raw.trim().length === 0) {
        setFieldError(inputEl, errorEl, "Name is required.");
        return false;
    }
    if (/^\s|\s$|\s{2,}/.test(raw)) {
        setFieldError(inputEl, errorEl, "Please enter a valid name without extra spaces.");
        return false;
    }
    const nameRegex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
    if (!nameRegex.test(raw)) {
        setFieldError(inputEl, errorEl, "Name must contain only letters, with spaces, hyphens, or apostrophes between words.");
        return false;
    }
    clearFieldError(inputEl, errorEl);
    return true;
}

function validateEmail(val, inputEl, errorEl) {
    const trimmed = (val || "").trim();
    if (!trimmed) {
        setFieldError(inputEl, errorEl, "Email is required.");
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
        setFieldError(inputEl, errorEl, "Please enter a valid email address.");
        return false;
    }
    clearFieldError(inputEl, errorEl);
    return true;
}

function validateRequired(val, fieldName, inputEl, errorEl) {
    const trimmed = (val || "").trim();
    if (!trimmed) {
        setFieldError(inputEl, errorEl, `${fieldName} is required.`);
        return false;
    }
    clearFieldError(inputEl, errorEl);
    return true;
}

function validateTextWithLetters(val, fieldName, inputEl, errorEl) {
    const trimmed = (val || "").trim();
    if (!trimmed) {
        setFieldError(inputEl, errorEl, `${fieldName} is required.`);
        return false;
    }
    if (!/[a-zA-Z]/.test(trimmed)) {
        setFieldError(inputEl, errorEl, `${fieldName} must contain at least one letter.`);
        return false;
    }
    clearFieldError(inputEl, errorEl);
    return true;
}

function validatePositiveInt(val, fieldName, inputEl, errorEl) {
    const str = String(val || "").trim();
    if (!str) {
        setFieldError(inputEl, errorEl, `${fieldName} is required.`);
        return false;
    }
    // Strict positive integer: no 0, no negative, no decimals, no letters
    if (!/^[1-9]\d*$/.test(str)) {
        setFieldError(inputEl, errorEl, `${fieldName} must be a positive whole number (1 or more).`);
        return false;
    }
    clearFieldError(inputEl, errorEl);
    return true;
}

function validateDateTime(val, fieldName, inputEl, errorEl) {
    const str = String(val || "").trim();
    if (!str) {
        setFieldError(inputEl, errorEl, `${fieldName} is required.`);
        return false;
    }
    const timestamp = Date.parse(str);
    if (isNaN(timestamp)) {
        setFieldError(inputEl, errorEl, `Please enter a valid date and time.`);
        return false;
    }
    clearFieldError(inputEl, errorEl);
    return true;
}

// Button loading state helper
function setButtonLoading(button, isLoading, loadingText = "Saving...") {
    if (!button) return;
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = `<span>${loadingText}</span>`;
    } else {
        button.disabled = false;
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
        }
    }
}

// Date Formatter helper
function formatDateTime(isoString) {
    if (!isoString) return "—";
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return isoString;
        const day = date.getDate();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    } catch {
        return isoString;
    }
}

// ==========================================================================
// 1. DASHBOARD MODULE
// ==========================================================================
async function updateDashboardCounts() {
    const [alumniRes, studentsRes, mentorshipsRes, sessionsRes] = await Promise.all([
        apiRequest("/api/alumni"),
        apiRequest("/api/students"),
        apiRequest("/api/mentorships"),
        apiRequest("/api/sessions")
    ]);

    const alumniEl = document.getElementById("stat-alumni");
    const studentsEl = document.getElementById("stat-students");
    const mentorshipsEl = document.getElementById("stat-mentorships");
    const sessionsEl = document.getElementById("stat-sessions");

    if (alumniEl) alumniEl.textContent = alumniRes.success && Array.isArray(alumniRes.data) ? alumniRes.data.length : "0";
    if (studentsEl) studentsEl.textContent = studentsRes.success && Array.isArray(studentsRes.data) ? studentsRes.data.length : "0";
    if (mentorshipsEl) mentorshipsEl.textContent = mentorshipsRes.success && Array.isArray(mentorshipsRes.data) ? mentorshipsRes.data.length : "0";
    if (sessionsEl) sessionsEl.textContent = sessionsRes.success && Array.isArray(sessionsRes.data) ? sessionsRes.data.length : "0";
}

// ==========================================================================
// 2. ALUMNI MODULE
// ==========================================================================
async function loadAlumni() {
    const tbody = document.getElementById("alumni-table-body");
    const countEl = document.getElementById("alumni-count");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Loading alumni...</td></tr>`;

    const res = await apiRequest("/api/alumni");
    if (!res.success) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">${res.error}</td></tr>`;
        if (countEl) countEl.textContent = "0";
        return;
    }

    const alumniList = res.data || [];
    if (countEl) countEl.textContent = alumniList.length;

    if (alumniList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No alumni registered yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = alumniList.map(a => `
        <tr>
            <td><strong>#${a.id}</strong></td>
            <td>${escapeHtml(a.name)}</td>
            <td>${escapeHtml(a.email)}</td>
            <td>${escapeHtml(a.expertise || "-")}</td>
            <td><span class="badge badge-scheduled">${a.maxMentees} mentees</span></td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteAlumni(${a.id})">Delete</button>
            </td>
        </tr>
    `).join("");
}

async function handleAlumniSubmit(e) {
    e.preventDefault();

    const nameInput = document.getElementById("alumni-name");
    const emailInput = document.getElementById("alumni-email");
    const expertiseInput = document.getElementById("alumni-expertise");
    const maxMenteesInput = document.getElementById("alumni-max-mentees");
    const submitBtn = document.getElementById("btn-submit-alumni");

    const nameError = document.getElementById("alumni-name-error");
    const emailError = document.getElementById("alumni-email-error");
    const expertiseError = document.getElementById("alumni-expertise-error");
    const maxMenteesError = document.getElementById("alumni-max-mentees-error");

    const validName = validateName(nameInput.value, nameInput, nameError);
    const validEmail = validateEmail(emailInput.value, emailInput, emailError);
    const validExpertise = validateTextWithLetters(expertiseInput.value, "Expertise", expertiseInput, expertiseError);
    const validMaxMentees = validatePositiveInt(maxMenteesInput.value, "Maximum Mentees", maxMenteesInput, maxMenteesError);

    if (!validName || !validEmail || !validExpertise || !validMaxMentees) {
        return;
    }

    const payload = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        expertise: expertiseInput.value.trim(),
        maxMentees: parseInt(maxMenteesInput.value, 10)
    };

    setButtonLoading(submitBtn, true, "Adding Alumni...");

    const res = await apiRequest("/api/alumni", {
        method: "POST",
        body: JSON.stringify(payload)
    });

    setButtonLoading(submitBtn, false);

    if (res.success) {
        showToast("Alumni added successfully.", "success");
        document.getElementById("form-alumni").reset();
        clearFieldError(nameInput, nameError);
        clearFieldError(emailInput, emailError);
        clearFieldError(expertiseInput, expertiseError);
        clearFieldError(maxMenteesInput, maxMenteesError);
        loadAlumni();
        updateDashboardCounts();
    } else {
        showToast(res.error, "error");
    }
}

async function deleteAlumni(id) {
    if (!confirm(`Are you sure you want to delete Alumni #${id}?`)) {
        return;
    }

    const res = await apiRequest(`/api/alumni/${id}`, { method: "DELETE" });
    if (res.success) {
        showToast("Alumni deleted successfully.", "success");
        loadAlumni();
        loadMentorshipDropdowns();
        loadMentorships();
        loadSessionMentorshipDropdown();
        updateDashboardCounts();
    } else {
        showToast(res.error, "error");
    }
}

// ==========================================================================
// 3. STUDENT MODULE
// ==========================================================================
async function loadStudents() {
    const tbody = document.getElementById("student-table-body");
    const countEl = document.getElementById("student-count");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Loading students...</td></tr>`;

    const res = await apiRequest("/api/students");
    if (!res.success) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">${res.error}</td></tr>`;
        if (countEl) countEl.textContent = "0";
        return;
    }

    const students = res.data || [];
    if (countEl) countEl.textContent = students.length;

    if (students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No students registered yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = students.map(s => `
        <tr>
            <td><strong>#${s.id}</strong></td>
            <td>${escapeHtml(s.name)}</td>
            <td>${escapeHtml(s.email)}</td>
            <td>${escapeHtml(s.interests || "-")}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteStudent(${s.id})">Delete</button>
            </td>
        </tr>
    `).join("");
}

async function handleStudentSubmit(e) {
    e.preventDefault();

    const nameInput = document.getElementById("student-name");
    const emailInput = document.getElementById("student-email");
    const interestsInput = document.getElementById("student-interests");
    const submitBtn = document.getElementById("btn-submit-student");

    const nameError = document.getElementById("student-name-error");
    const emailError = document.getElementById("student-email-error");
    const interestsError = document.getElementById("student-interests-error");

    const validName = validateName(nameInput.value, nameInput, nameError);
    const validEmail = validateEmail(emailInput.value, emailInput, emailError);
    const validInterests = validateTextWithLetters(interestsInput.value, "Interests", interestsInput, interestsError);

    if (!validName || !validEmail || !validInterests) {
        return;
    }

    const payload = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        interests: interestsInput.value.trim()
    };

    setButtonLoading(submitBtn, true, "Adding Student...");

    const res = await apiRequest("/api/students", {
        method: "POST",
        body: JSON.stringify(payload)
    });

    setButtonLoading(submitBtn, false);

    if (res.success) {
        showToast("Student added successfully.", "success");
        document.getElementById("form-student").reset();
        clearFieldError(nameInput, nameError);
        clearFieldError(emailInput, emailError);
        clearFieldError(interestsInput, interestsError);
        loadStudents();
        updateDashboardCounts();
    } else {
        showToast(res.error, "error");
    }
}

async function deleteStudent(id) {
    if (!confirm(`Are you sure you want to delete Student #${id}?`)) {
        return;
    }

    const res = await apiRequest(`/api/students/${id}`, { method: "DELETE" });
    if (res.success) {
        showToast("Student deleted successfully.", "success");
        loadStudents();
        loadMentorshipDropdowns();
        loadMentorships();
        loadSessionMentorshipDropdown();
        updateDashboardCounts();
    } else {
        showToast(res.error, "error");
    }
}

// ==========================================================================
// 4. MATCHING MODULE ("Find Mentors")
// ==========================================================================
async function handleMatchingSubmit(e) {
    e.preventDefault();

    const studentIdInput = document.getElementById("match-student-id");
    const studentIdError = document.getElementById("match-student-id-error");
    const submitBtn = document.getElementById("btn-find-matches");

    const placeholder = document.getElementById("matching-placeholder");
    const resultsHeader = document.getElementById("matching-results-header");
    const resultsGrid = document.getElementById("matching-grid");
    const matchesCount = document.getElementById("matches-count");

    const isValid = validatePositiveInt(studentIdInput.value, "Student ID", studentIdInput, studentIdError);
    if (!isValid) {
        return;
    }

    const studentId = parseInt(studentIdInput.value.trim(), 10);
    setButtonLoading(submitBtn, true, "Finding Mentors...");

    // Temporary loading state
    placeholder.style.display = "block";
    placeholder.innerHTML = `
        <div class="empty-state-loading">
            <div class="spinner"></div>
            <p>Finding matching mentors...</p>
        </div>
    `;
    resultsHeader.style.display = "none";
    resultsGrid.style.display = "none";

    const res = await apiRequest(`/api/matching/student/${studentId}`);
    setButtonLoading(submitBtn, false);

    if (!res.success) {
        let msg = res.error;
        if (res.status === 404) {
            msg = `Requested student (ID #${studentId}) was not found.`;
        }
        showToast(msg, "error");
        setFieldError(studentIdInput, studentIdError, msg);

        placeholder.style.display = "block";
        placeholder.innerHTML = `
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h4>Student Not Found</h4>
            <p>${escapeHtml(msg)}</p>
        `;
        resultsHeader.style.display = "none";
        resultsGrid.style.display = "none";
        return;
    }

    clearFieldError(studentIdInput, studentIdError);
    const matches = res.data || [];

    if (matches.length === 0) {
        placeholder.style.display = "block";
        placeholder.innerHTML = `
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
            <h4>No matching mentors found</h4>
            <p>Try checking the student's interests or try another student.</p>
        `;
        resultsHeader.style.display = "none";
        resultsGrid.style.display = "none";
        return;
    }

    placeholder.style.display = "none";
    resultsHeader.style.display = "block";
    resultsGrid.style.display = "grid";
    if (matchesCount) matchesCount.textContent = matches.length;

    resultsGrid.innerHTML = matches.map(alumni => {
        const expertiseList = (alumni.expertise || "")
            .split(",")
            .map(t => t.trim())
            .filter(Boolean);

        const expertiseTags = expertiseList.length > 0
            ? expertiseList.map(t => `<span class="expertise-tag">${escapeHtml(t)}</span>`).join("")
            : `<span class="text-muted" style="font-size: 0.8rem;">None specified</span>`;

        const hasCapacity = (typeof alumni.maxMentees === "number" && alumni.maxMentees > 0);
        const capacityBadge = hasCapacity
            ? `<span class="mentor-status-badge status-available"><span class="status-dot"></span>Capacity Available</span>`
            : `<span class="mentor-status-badge status-unavailable">No Capacity</span>`;

        return `
            <div class="mentor-card">
                <div class="mentor-card-main">
                    <div class="mentor-card-top">
                        <h4 class="mentor-name">${escapeHtml(alumni.name || "Alumni Mentor")}</h4>
                        ${capacityBadge}
                    </div>
                    <div class="mentor-email">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <span>${escapeHtml(alumni.email || "-")}</span>
                    </div>

                    <div class="mentor-details">
                        <div class="mentor-meta-row">
                            <span class="mentor-meta-label">Maximum Mentees:</span>
                            <span class="mentor-meta-value">${alumni.maxMentees ?? "-"}</span>
                        </div>

                        <div class="mentor-expertise-section">
                            <span class="mentor-meta-label">Expertise:</span>
                            <div class="mentor-expertise-tags">
                                ${expertiseTags}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mentor-actions">
                    <button type="button" class="btn btn-sm btn-primary" onclick="selectMentorForPair(${alumni.id}, ${studentId})">
                        Select for Mentorship
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

// Quick helper to prefill mentorship form from matching results
async function selectMentorForPair(alumniId, studentId) {
    switchSection("mentorships");
    const alumniSelect = document.getElementById("mentorship-alumni-id");
    const studentSelect = document.getElementById("mentorship-student-id");

    if (alumniDropdownData.length > 0 && studentDropdownData.length > 0) {
        if (alumniSelect) alumniSelect.value = String(alumniId);
        if (studentSelect) studentSelect.value = String(studentId);
        updateMentorshipHelperHints();
    } else {
        await loadMentorshipDropdowns(alumniId, studentId);
    }
    showToast(`Selected Alumni #${alumniId} for Student #${studentId}`, "info");
}

// ==========================================================================
// 5. MENTORSHIP MODULE
// ==========================================================================
let alumniDropdownData = [];
let studentDropdownData = [];

async function loadMentorshipDropdowns(selectedAlumniId = null, selectedStudentId = null) {
    const alumniSelect = document.getElementById("mentorship-alumni-id");
    const studentSelect = document.getElementById("mentorship-student-id");
    const alumniError = document.getElementById("mentorship-alumni-id-error");
    const studentError = document.getElementById("mentorship-student-id-error");
    if (!alumniSelect || !studentSelect) return;

    alumniSelect.disabled = true;
    studentSelect.disabled = true;

    const currentAlumniVal = selectedAlumniId !== null ? String(selectedAlumniId) : alumniSelect.value;
    const currentStudentVal = selectedStudentId !== null ? String(selectedStudentId) : studentSelect.value;

    alumniSelect.innerHTML = `<option value="">Loading Alumni...</option>`;
    studentSelect.innerHTML = `<option value="">Loading Students...</option>`;

    try {
        const [alumniRes, studentsRes] = await Promise.all([
            apiRequest("/api/alumni"),
            apiRequest("/api/students")
        ]);

        if (alumniRes.success && Array.isArray(alumniRes.data)) {
            alumniDropdownData = alumniRes.data;
            alumniSelect.innerHTML = `<option value="">Select Alumni</option>` +
                alumniRes.data.map(a => `<option value="${a.id}">${escapeHtml(a.name)} (ID: ${a.id})</option>`).join("");
            if (currentAlumniVal && alumniRes.data.some(a => String(a.id) === currentAlumniVal)) {
                alumniSelect.value = currentAlumniVal;
            } else {
                alumniSelect.value = "";
            }
            alumniSelect.disabled = false;
        } else {
            alumniSelect.innerHTML = `<option value="">Failed to load alumni</option>`;
            setFieldError(alumniSelect, alumniError, "Failed to load alumni list. Please refresh.");
        }

        if (studentsRes.success && Array.isArray(studentsRes.data)) {
            studentDropdownData = studentsRes.data;
            studentSelect.innerHTML = `<option value="">Select Student</option>` +
                studentsRes.data.map(s => `<option value="${s.id}">${escapeHtml(s.name)} (ID: ${s.id})</option>`).join("");
            if (currentStudentVal && studentsRes.data.some(s => String(s.id) === currentStudentVal)) {
                studentSelect.value = currentStudentVal;
            } else {
                studentSelect.value = "";
            }
            studentSelect.disabled = false;
        } else {
            studentSelect.innerHTML = `<option value="">Failed to load students</option>`;
            setFieldError(studentSelect, studentError, "Failed to load student list. Please refresh.");
        }

        updateMentorshipHelperHints();

    } catch (err) {
        console.error("Error loading dropdown data:", err);
        alumniSelect.innerHTML = `<option value="">Error loading alumni</option>`;
        studentSelect.innerHTML = `<option value="">Error loading students</option>`;
    }
}

function updateMentorshipHelperHints() {
    const alumniSelect = document.getElementById("mentorship-alumni-id");
    const studentSelect = document.getElementById("mentorship-student-id");
    const alumniHint = document.getElementById("mentorship-alumni-hint");
    const studentHint = document.getElementById("mentorship-student-hint");

    if (alumniHint && alumniSelect) {
        if (alumniSelect.value) {
            const found = alumniDropdownData.find(a => String(a.id) === String(alumniSelect.value));
            if (found) {
                alumniHint.innerHTML = `<span style="color: var(--primary); font-weight: 500;">Selected mentor: ${escapeHtml(found.name)}</span>`;
            } else {
                alumniHint.textContent = "Select a registered alumni mentor";
            }
        } else {
            alumniHint.textContent = "Select a registered alumni mentor";
        }
    }

    if (studentHint && studentSelect) {
        if (studentSelect.value) {
            const found = studentDropdownData.find(s => String(s.id) === String(studentSelect.value));
            if (found) {
                studentHint.innerHTML = `<span style="color: var(--primary); font-weight: 500;">Selected student: ${escapeHtml(found.name)}</span>`;
            } else {
                studentHint.textContent = "Select a registered student mentee";
            }
        } else {
            studentHint.textContent = "Select a registered student mentee";
        }
    }
}
function formatMatchedDate(isoString) {
    if (!isoString) return "Not available";
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return "Not available";
        const day = date.getDate();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    } catch {
        return "Not available";
    }
}

function getMentorshipStatusBadge(status) {
    const s = (status || "").toUpperCase();
    if (s === "ACTIVE") {
        return `<span class="badge badge-active">${escapeHtml(status || "ACTIVE")}</span>`;
    } else if (s === "COMPLETED") {
        return `<span class="badge badge-completed">${escapeHtml(status || "COMPLETED")}</span>`;
    } else {
        return `<span class="badge badge-neutral">${escapeHtml(status || "UNKNOWN")}</span>`;
    }
}

let isLoadingMentorships = false;
async function loadMentorships() {
    if (isLoadingMentorships) return;
    const tbody = document.getElementById("mentorship-table-body");
    const countEl = document.getElementById("mentorship-count");
    if (!tbody) return;

    isLoadingMentorships = true;
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                <div class="table-loading-state">
                    <div class="spinner"></div>
                    <p class="text-muted">Loading mentorship pairs...</p>
                </div>
            </td>
        </tr>
    `;

    try {
        const [mentorshipRes, alumniRes, studentsRes] = await Promise.all([
            apiRequest("/api/mentorships"),
            (alumniDropdownData && alumniDropdownData.length > 0) ? Promise.resolve({ success: true, data: alumniDropdownData }) : apiRequest("/api/alumni"),
            (studentDropdownData && studentDropdownData.length > 0) ? Promise.resolve({ success: true, data: studentDropdownData }) : apiRequest("/api/students")
        ]);

        if (!mentorshipRes.success) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">${escapeHtml(mentorshipRes.error)}</td></tr>`;
            if (countEl) countEl.textContent = "0";
            return;
        }

        const alumniMap = {};
        if (alumniRes && alumniRes.success && Array.isArray(alumniRes.data)) {
            alumniDropdownData = alumniRes.data;
            alumniRes.data.forEach(a => { alumniMap[a.id] = a.name; });
        }

        const studentMap = {};
        if (studentsRes && studentsRes.success && Array.isArray(studentsRes.data)) {
            studentDropdownData = studentsRes.data;
            studentsRes.data.forEach(s => { studentMap[s.id] = s.name; });
        }

        const pairs = mentorshipRes.data || [];
        if (countEl) countEl.textContent = pairs.length;

        if (pairs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="empty-state table-empty-state">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <h4>No mentorships yet</h4>
                            <p>Create a mentorship pairing to get started.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = pairs.map(p => {
            const alumniName = alumniMap[p.alumniId];
            const studentName = studentMap[p.studentId];

            const alumniDisplay = alumniName
                ? `${escapeHtml(alumniName)} (#${p.alumniId})`
                : `Alumni #${p.alumniId}`;

            const studentDisplay = studentName
                ? `${escapeHtml(studentName)} (#${p.studentId})`
                : `Student #${p.studentId}`;

            return `
                <tr>
                    <td><span class="cell-id">#${p.id}</span></td>
                    <td><span class="cell-entity">${alumniDisplay}</span></td>
                    <td><span class="cell-entity">${studentDisplay}</span></td>
                    <td>${getMentorshipStatusBadge(p.status)}</td>
                    <td class="cell-date">${formatMatchedDate(p.matchedAt)}</td>
                    <td class="cell-actions">
                        <button type="button" class="btn btn-sm btn-danger btn-delete-mentorship" onclick="deleteMentorship(${p.id})" title="Delete Mentorship Pair #${p.id}">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            <span>Delete</span>
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    } finally {
        isLoadingMentorships = false;
    }
}

async function handleMentorshipSubmit(e) {
    e.preventDefault();

    const alumniIdInput = document.getElementById("mentorship-alumni-id");
    const studentIdInput = document.getElementById("mentorship-student-id");
    const submitBtn = document.getElementById("btn-submit-mentorship");

    const alumniIdError = document.getElementById("mentorship-alumni-id-error");
    const studentIdError = document.getElementById("mentorship-student-id-error");

    let hasError = false;
    if (!alumniIdInput.value || alumniIdInput.value.trim() === "") {
        setFieldError(alumniIdInput, alumniIdError, "Please select an alumni mentor.");
        hasError = true;
    } else {
        clearFieldError(alumniIdInput, alumniIdError);
    }

    if (!studentIdInput.value || studentIdInput.value.trim() === "") {
        setFieldError(studentIdInput, studentIdError, "Please select a student mentee.");
        hasError = true;
    } else {
        clearFieldError(studentIdInput, studentIdError);
    }

    if (hasError) {
        return;
    }

    const payload = {
        alumniId: parseInt(alumniIdInput.value.trim(), 10),
        studentId: parseInt(studentIdInput.value.trim(), 10)
    };

    setButtonLoading(submitBtn, true, "Creating Pair...");

    const res = await apiRequest("/api/mentorships", {
        method: "POST",
        body: JSON.stringify(payload)
    });

    setButtonLoading(submitBtn, false);

    if (res.success) {
        showToast("Mentorship created successfully.", "success");
        document.getElementById("form-mentorship").reset();
        clearFieldError(alumniIdInput, alumniIdError);
        clearFieldError(studentIdInput, studentIdError);
        alumniIdInput.value = "";
        studentIdInput.value = "";
        updateMentorshipHelperHints();
        loadMentorships();
        loadSessionMentorshipDropdown();
        updateDashboardCounts();
    } else {
        showToast(res.error, "error");
        // Display mentor capacity or not found directly under relevant field
        if (res.error.includes("capacity")) {
            setFieldError(alumniIdInput, alumniIdError, res.error);
        } else if (res.error.toLowerCase().includes("alumni")) {
            setFieldError(alumniIdInput, alumniIdError, res.error);
        } else if (res.error.toLowerCase().includes("student")) {
            setFieldError(studentIdInput, studentIdError, res.error);
        }
    }
}

async function deleteMentorship(id) {
    if (!confirm(`Are you sure you want to delete Mentorship Pair #${id}?`)) {
        return;
    }

    const res = await apiRequest(`/api/mentorships/${id}`, { method: "DELETE" });
    if (res.success) {
        showToast("Mentorship deleted successfully.", "success");
        loadMentorships();
        loadSessionMentorshipDropdown();
        loadSessions();
        updateDashboardCounts();
    } else {
        showToast(res.error, "error");
    }
}

// ==========================================================================
// 6. SESSION MODULE
// ==========================================================================
let mentorshipDropdownData = [];

async function loadSessionMentorshipDropdown(selectedPairId = null) {
    const pairSelect = document.getElementById("session-pair-id");
    if (!pairSelect) return;

    const currentVal = selectedPairId !== null ? String(selectedPairId) : pairSelect.value;
    pairSelect.disabled = true;
    pairSelect.innerHTML = `<option value="">Loading mentorship pairs...</option>`;

    try {
        const res = await apiRequest("/api/mentorships");
        if (res.success && Array.isArray(res.data)) {
            mentorshipDropdownData = res.data;
            if (res.data.length === 0) {
                pairSelect.innerHTML = `<option value="">No mentorship pairs available</option>`;
                pairSelect.disabled = false;
                return;
            }
            pairSelect.innerHTML = `<option value="">Select Mentorship Pair</option>` +
                res.data.map(p => `<option value="${p.id}">Mentorship #${p.id} (Alumni #${p.alumniId} → Student #${p.studentId})</option>`).join("");

            if (currentVal && res.data.some(p => String(p.id) === currentVal)) {
                pairSelect.value = currentVal;
            } else {
                pairSelect.value = "";
            }
            pairSelect.disabled = false;
        } else {
            pairSelect.innerHTML = `<option value="">Failed to load mentorship pairs</option>`;
        }
    } catch (err) {
        console.error("Error loading session mentorship pairs:", err);
        pairSelect.innerHTML = `<option value="">Error loading pairs</option>`;
    }
}

function getSessionStatusBadge(status) {
    const s = (status || "").toUpperCase();
    if (s === "SCHEDULED") {
        return `<span class="badge badge-scheduled">Scheduled</span>`;
    } else if (s === "COMPLETED") {
        return `<span class="badge badge-completed">Completed</span>`;
    } else if (s === "CANCELLED") {
        return `<span class="badge badge-cancelled">Cancelled</span>`;
    } else {
        return `<span class="badge badge-neutral">${escapeHtml(status || "UNKNOWN")}</span>`;
    }
}

async function loadSessions() {
    const tbody = document.getElementById("session-table-body");
    const countEl = document.getElementById("session-count");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Loading sessions...</td></tr>`;

    const res = await apiRequest("/api/sessions");
    if (!res.success) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">${escapeHtml(res.error)}</td></tr>`;
        if (countEl) countEl.textContent = "0";
        return;
    }

    const sessions = res.data || [];
    if (countEl) countEl.textContent = sessions.length;

    if (sessions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No sessions scheduled yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = sessions.map(s => `
        <tr>
            <td><strong>#${s.id}</strong></td>
            <td>Pair #${s.mentorshipPairId}</td>
            <td>${formatDateTime(s.scheduledAt)}</td>
            <td>${getSessionStatusBadge(s.status)}</td>
            <td>${escapeHtml(s.notes || "-")}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteSession(${s.id})">Delete</button>
            </td>
        </tr>
    `).join("");
}

async function handleSessionSubmit(e) {
    e.preventDefault();

    const pairIdInput = document.getElementById("session-pair-id");
    const scheduledAtInput = document.getElementById("session-scheduled-at");
    const statusSelect = document.getElementById("session-status");
    const notesInput = document.getElementById("session-notes");
    const submitBtn = document.getElementById("btn-submit-session");

    const pairIdError = document.getElementById("session-pair-id-error");
    const scheduledAtError = document.getElementById("session-scheduled-at-error");
    const statusError = document.getElementById("session-status-error");

    const validPair = validatePositiveInt(pairIdInput.value, "Mentorship Pair", pairIdInput, pairIdError);
    const validDate = validateDateTime(scheduledAtInput.value, "Scheduled Date & Time", scheduledAtInput, scheduledAtError);
    const validStatus = validateRequired(statusSelect.value, "Status", statusSelect, statusError);

    if (!validPair || !validDate || !validStatus) {
        return;
    }

    // Format ISO string format without milliseconds for LocalDateTime compatibility
    const dt = new Date(scheduledAtInput.value);
    const localIso = formatLocalIso(dt);

    const payload = {
        mentorshipPairId: parseInt(pairIdInput.value.trim(), 10),
        scheduledAt: localIso,
        status: statusSelect.value,
        notes: notesInput.value.trim() || null
    };

    setButtonLoading(submitBtn, true, "Scheduling Session...");

    const res = await apiRequest("/api/sessions", {
        method: "POST",
        body: JSON.stringify(payload)
    });

    setButtonLoading(submitBtn, false);

    if (res.success) {
        showToast("Session created successfully.", "success");
        document.getElementById("form-session").reset();
        clearFieldError(pairIdInput, pairIdError);
        clearFieldError(scheduledAtInput, scheduledAtError);
        clearFieldError(statusSelect, statusError);
        loadSessions();
        updateDashboardCounts();
    } else {
        showToast(res.error, "error");
    }
}

async function deleteSession(id) {
    if (!confirm(`Are you sure you want to delete Session #${id}?`)) {
        return;
    }

    const res = await apiRequest(`/api/sessions/${id}`, { method: "DELETE" });
    if (res.success) {
        showToast("Session deleted successfully.", "success");
        loadSessions();
        updateDashboardCounts();
    } else {
        showToast(res.error, "error");
    }
}

// Convert local date to YYYY-MM-DDTHH:mm:ss for Spring Boot LocalDateTime
function formatLocalIso(d) {
    const pad = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// ==========================================================================
// Form & Event Listeners
// ==========================================================================
function initForms() {
    const alumniForm = document.getElementById("form-alumni");
    if (alumniForm) {
        alumniForm.addEventListener("submit", handleAlumniSubmit);
        alumniForm.addEventListener("reset", () => {
            const alumniName = document.getElementById("alumni-name");
            const alumniNameError = document.getElementById("alumni-name-error");
            clearFieldError(alumniName, alumniNameError);
        });
    }

    const studentForm = document.getElementById("form-student");
    if (studentForm) {
        studentForm.addEventListener("submit", handleStudentSubmit);
        studentForm.addEventListener("reset", () => {
            const studentName = document.getElementById("student-name");
            const studentNameError = document.getElementById("student-name-error");
            clearFieldError(studentName, studentNameError);
        });
    }

    const alumniName = document.getElementById("alumni-name");
    if (alumniName) {
        alumniName.addEventListener("input", () => {
            const errorEl = document.getElementById("alumni-name-error");
            if (errorEl && errorEl.classList.contains("active")) {
                validateName(alumniName.value, alumniName, errorEl);
            }
        });
    }

    const studentName = document.getElementById("student-name");
    if (studentName) {
        studentName.addEventListener("input", () => {
            const errorEl = document.getElementById("student-name-error");
            if (errorEl && errorEl.classList.contains("active")) {
                validateName(studentName.value, studentName, errorEl);
            }
        });
    }

    const matchingForm = document.getElementById("form-matching");
    if (matchingForm) matchingForm.addEventListener("submit", handleMatchingSubmit);

    const mentorshipForm = document.getElementById("form-mentorship");
    if (mentorshipForm) {
        mentorshipForm.addEventListener("submit", handleMentorshipSubmit);
        mentorshipForm.addEventListener("reset", () => {
            const alumniSelect = document.getElementById("mentorship-alumni-id");
            const studentSelect = document.getElementById("mentorship-student-id");
            const alumniError = document.getElementById("mentorship-alumni-id-error");
            const studentError = document.getElementById("mentorship-student-id-error");
            clearFieldError(alumniSelect, alumniError);
            clearFieldError(studentSelect, studentError);
            setTimeout(() => {
                if (alumniSelect) alumniSelect.value = "";
                if (studentSelect) studentSelect.value = "";
                updateMentorshipHelperHints();
            }, 10);
        });
    }

    const alumniSelect = document.getElementById("mentorship-alumni-id");
    if (alumniSelect) {
        alumniSelect.addEventListener("change", () => {
            const alumniError = document.getElementById("mentorship-alumni-id-error");
            clearFieldError(alumniSelect, alumniError);
            updateMentorshipHelperHints();
        });
    }

    const studentSelect = document.getElementById("mentorship-student-id");
    if (studentSelect) {
        studentSelect.addEventListener("change", () => {
            const studentError = document.getElementById("mentorship-student-id-error");
            clearFieldError(studentSelect, studentError);
            updateMentorshipHelperHints();
        });
    }

    const sessionForm = document.getElementById("form-session");
    if (sessionForm) {
        sessionForm.addEventListener("submit", handleSessionSubmit);
        sessionForm.addEventListener("reset", () => {
            const pairSelect = document.getElementById("session-pair-id");
            const pairError = document.getElementById("session-pair-id-error");
            const scheduledAtInput = document.getElementById("session-scheduled-at");
            const scheduledAtError = document.getElementById("session-scheduled-at-error");
            const statusSelect = document.getElementById("session-status");
            const statusError = document.getElementById("session-status-error");
            clearFieldError(pairSelect, pairError);
            clearFieldError(scheduledAtInput, scheduledAtError);
            clearFieldError(statusSelect, statusError);
            setTimeout(() => {
                if (pairSelect) pairSelect.value = "";
            }, 10);
        });
    }

    const sessionPairSelect = document.getElementById("session-pair-id");
    if (sessionPairSelect) {
        sessionPairSelect.addEventListener("change", () => {
            const pairError = document.getElementById("session-pair-id-error");
            clearFieldError(sessionPairSelect, pairError);
        });
    }
}

function initRefreshButtons() {
    const btnRefreshDashboard = document.getElementById("btn-refresh-dashboard");
    if (btnRefreshDashboard) {
        btnRefreshDashboard.addEventListener("click", () => {
            updateDashboardCounts();
            showToast("Dashboard stats refreshed.", "info");
        });
    }

    const btnRefreshAlumni = document.getElementById("btn-refresh-alumni");
    if (btnRefreshAlumni) {
        btnRefreshAlumni.addEventListener("click", () => {
            loadAlumni();
            showToast("Alumni list refreshed.", "info");
        });
    }

    const btnRefreshStudents = document.getElementById("btn-refresh-students");
    if (btnRefreshStudents) {
        btnRefreshStudents.addEventListener("click", () => {
            loadStudents();
            showToast("Student list refreshed.", "info");
        });
    }

    const btnRefreshMentorships = document.getElementById("btn-refresh-mentorships");
    if (btnRefreshMentorships) {
        btnRefreshMentorships.addEventListener("click", () => {
            loadMentorships();
            loadMentorshipDropdowns();
            loadSessionMentorshipDropdown();
            showToast("Mentorship list refreshed.", "info");
        });
    }

    const btnRefreshSessions = document.getElementById("btn-refresh-sessions");
    if (btnRefreshSessions) {
        btnRefreshSessions.addEventListener("click", () => {
            loadSessions();
            loadSessionMentorshipDropdown();
            showToast("Session list refreshed.", "info");
        });
    }
}

// ==========================================================================
// Utility: HTML Escaping
// ==========================================================================
function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
