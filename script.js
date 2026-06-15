/**
 * ==========================================================================
 * 1. REGISTRE ET ENGINE DES TRADUCTIONS ET ETATS APPLICATIFS
 * ==========================================================================
 */
const WEB3_ACCESS_KEY = "91cc0db1-566d-4958-9c62-3f03b199a63a";

const PRICING_MATRIX = {
    robo_jr: { monthly: 80, quarterly: 210 },
    robo_sr: { monthly: 80, quarterly: 210 },
    web_front: { monthly: 60, quarterly: 160 },
    web_back:  { monthly: 60, quarterly: 160 },
    school_2:   { monthly: 60, quarterly: 160 },
    school_3:   { monthly: 60, quarterly: 160 },
    school_bac: { monthly: 60, quarterly: 160 }
};

const DICTIONARY = {
    fr: {
        nav_home: "Accueil", nav_courses: "Programmes", nav_join: "S'inscrire",
        hero_badge: "Inscriptions Ouvertes — Session 2026",
        hero_title: "Découvrez le code et la robotique.",
        hero_subtitle: "Le club tech d'élite pour enfants, adolescents et lycéens. Apprenez par la pratique avec des mentors passionnés.",
        btn_start: "Rejoindre le Club", btn_explore: "Voir les Programmes",
        track_robo: "Robotique & Électronique", track_robo_desc: "De l'assemblage mécanique à la programmation de circuits et de capteurs Arduino.",
        track_web: "Développement Web & Code", track_web_desc: "Créez de vraies applications web fonctionnelles avec les langages fondamentaux de l'industrie.",
        track_school: "Soutien Informatique Lycée", track_school_desc: "Accompagnement rigoureux pour les élèves de 2ème, 3ème année et préparation à l'épreuve du BAC.",
        footer_desc: "Hive Academy est un club d'apprentissage technologique dédié à la formation pratique de la nouvelle génération de créateurs.",
        footer_nav: "Navigation", footer_location: "Localisation",
        form_title: "Demande d'Inscription", form_subtitle: "Remplissez ce formulaire d'admission. Notre équipe prendra contact avec vous rapidement.",
        lbl_program: "Sélectionnez le Programme", lbl_name: "Nom complet de l'élève", lbl_phone: "Numéro de téléphone",
        lbl_email: "Adresse e-mail", lbl_total: "Tarif calculé :", btn_submit: "Envoyer l'inscription",
        opt_monthly: "Forfait Mensuel", opt_quarterly: "Forfait Trimestriel", opt_save: "Économisez sur 3 mois",
        msg_success: "Félicitations ! Dossier reçu. Nous vous appellerons sous peu.", msg_error: "Échec. Veuillez nous contacter directement au 55 328 004."
    },
    en: {
        nav_home: "Home", nav_courses: "Programs", nav_join: "Join Us",
        hero_badge: "Enrollments Open — 2026 Session",
        hero_title: "Master coding and robotics.",
        hero_subtitle: "The elite tech club for kids, teens, and high schoolers. Learn hands-on with dedicated tech mentors.",
        btn_start: "Join the Club", btn_explore: "Explore Programs",
        track_robo: "Robotics & Electronics", track_robo_desc: "From basic mechanical assembly to programming real Arduino circuits and sensors.",
        track_web: "Web Development & Code", track_web_desc: "Build responsive, live web applications using industry-standard programming languages.",
        track_school: "High School IT Support", track_school_desc: "Rigorous curriculum training for 2nd, 3rd year, and thorough exam prep for the BAC.",
        footer_desc: "Hive Academy is a practical technology club dedicated to training the next generation of digital creators.",
        footer_nav: "Navigation", footer_location: "Location",
        form_title: "Registration Form", form_subtitle: "Fill out the admission fields. Our desk manager will contact you shortly to lock your schedule.",
        lbl_program: "Select Core Program", lbl_name: "Student's Full Name", lbl_phone: "Phone Number",
        lbl_email: "Email Address", lbl_total: "Calculated Fee:", btn_submit: "Submit Registration",
        opt_monthly: "Monthly Plan", opt_quarterly: "Trimester Plan", opt_save: "Save on 3-month block",
        msg_success: "Success! Application received. We will call you back very soon.", msg_error: "System fault. Please call our line directly at 55 328 004."
    }
};

/**
 * ==========================================================================
 * 2. INITIALISATION DES SYSTEMES ET GESTION DES REFRESH
 * ==========================================================================
 */
let appState = {
    lang: localStorage.getItem('hive_lang') || 'fr',
    theme: localStorage.getItem('hive_theme') || 'light'
};

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initLanguage();
    bindEvents();
    evaluatePricing();
    markActiveNavigation();
});

function initTheme() {
    if (appState.theme === "dark") {
        document.body.setAttribute("data-theme", "dark");
    } else {
        document.body.removeAttribute("data-theme");
    }
    syncThemeIcon();
}

function initLanguage() {
    applyLanguagePack(appState.lang);
    syncLanguageButton();
}

function bindEvents() {
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            appState.theme = appState.theme === "light" ? "dark" : "light";
            localStorage.setItem('hive_theme', appState.theme);
            initTheme();
        });
    }

    const langToggle = document.getElementById("langToggle");
    if (langToggle) {
        langToggle.addEventListener("click", () => {
            appState.lang = appState.lang === "fr" ? "en" : "fr";
            localStorage.setItem('hive_lang', appState.lang);
            initLanguage();
            evaluatePricing();
        });
    }

    const courseField = document.getElementById("courseField");
    if (courseField) {
        courseField.addEventListener("change", evaluatePricing);
    }

    const planRadios = document.querySelectorAll('input[name="billing_term"]');
    planRadios.forEach(radio => {
        radio.addEventListener("change", evaluatePricing);
    });

    const admissionForm = document.getElementById("admissionForm");
    if (admissionForm) {
        const tokenInput = document.getElementById("web3_token_field");
        if (tokenInput) tokenInput.value = WEB3_ACCESS_KEY;
        admissionForm.addEventListener("submit", processFormTransmission);
    }
}

/**
 * ==========================================================================
 * 3. ENGINE DE CALCUL PRICING DYNAMIQUE
 * ==========================================================================
 */
function evaluatePricing() {
    const courseField = document.getElementById("courseField");
    const displayElement = document.getElementById("priceOutput");
    
    if (!courseField || !displayElement) return;

    const chosenCourse = courseField.value;
    const selectedRadio = document.querySelector('input[name="billing_term"]:checked');
    
    if (!chosenCourse || !selectedRadio) {
        displayElement.textContent = "0 TND";
        return;
    }

    const chosenTerm = selectedRadio.value;
    const pricingGroup = PRICING_MATRIX[chosenCourse];

    if (pricingGroup && pricingGroup[chosenTerm]) {
        const finalCost = pricingGroup[chosenTerm];
        displayElement.textContent = `${finalCost} TND`;
    }
}

/**
 * ==========================================================================
 * 4. ROUTAGE ET PACK TRANSLATION SYNCRONISÉ
 * ==========================================================================
 */
function applyLanguagePack(lang) {
    const stringSet = DICTIONARY[lang];
    if (!stringSet) return;

    document.querySelectorAll("[data-local]").forEach(node => {
        const accessKey = node.getAttribute("data-local");
        if (stringSet[accessKey]) {
            if (node.tagName === "INPUT" || node.tagName === "TEXTAREA") {
                node.placeholder = stringSet[accessKey];
            } else {
                node.innerHTML = stringSet[accessKey];
            }
        }
    });
}

function syncLanguageButton() {
    const langToggle = document.getElementById("langToggle");
    if (langToggle) {
        langToggle.textContent = appState.lang === "fr" ? "EN" : "FR";
    }
}

function syncThemeIcon() {
    const iconNode = document.querySelector("#themeToggle i");
    if (!iconNode) return;
    if (appState.theme === "dark") {
        iconNode.className = "fas fa-sun";
    } else {
        iconNode.className = "fas fa-moon";
    }
}

function markActiveNavigation() {
    const currentPath = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll(".nav-links a");
    
    navLinks.forEach(link => {
        const targetHref = link.getAttribute("href");
        if (currentPath === targetHref || (currentPath === "" && targetHref === "index.html")) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

/**
 * ==========================================================================
 * 5. MANAGEMENT SECURISE DES TRANSMISSIONS WEB3FORMS
 * ==========================================================================
 */
function processFormTransmission(event) {
    event.preventDefault();
    
    const activeForm = event.target;
    const triggerButton = document.getElementById("submitTrigger");
    const logsContainer = document.getElementById("logCallback");
    
    const initialLabel = triggerButton.innerHTML;
    triggerButton.innerHTML = appState.lang === "fr" ? "Envoi en cours..." : "Sending...";
    triggerButton.disabled = true;

    const dataPayload = new FormData(activeForm);
    const convertedJson = JSON.stringify(Object.fromEntries(dataPayload));

    fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: convertedJson
    })
    .then(async (reply) => {
        if (reply.status === 200) {
            logsContainer.textContent = DICTIONARY[appState.lang].msg_success;
            logsContainer.style.color = "#10B981";
            activeForm.reset();
            evaluatePricing();
        } else {
            throw new Error("Handshake failed");
        }
    })
    .catch(() => {
        logsContainer.textContent = DICTIONARY[appState.lang].msg_error;
        logsContainer.style.color = "#EF4444";
    })
    .finally(() => {
        triggerButton.innerHTML = initialLabel;
        triggerButton.disabled = false;
    });
}