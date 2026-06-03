document.addEventListener("DOMContentLoaded", () => {
    const listContainer = document.getElementById("tutor-list");
    const resultsCount = document.getElementById("results-count");
    const priceSlider = document.getElementById("price-slider");
    const priceLabel = document.getElementById("current-price-label");
    
    // NEW: Grab the sort dropdown
    const sortSelect = document.getElementById("sort-select");

    // 1. DEFINE YOUR EXACT FILTER LISTS
    const filterData = {
        subjects: [
            "SAT/PSAT", "Olympiad Physics", "Calculus", "AP Physics", 
            "AP Mathematics", "High School Mathematics", "High School Physics", "C++/Algorithms"
        ],
        locations: ["Tbilisi", "Kutaisi", "Batumi"],
        genders: ["Male", "Female"],
        lessonTypes: ["On site", "Online"]
    };

    // 2. STATE ARRAYS
    let activeFilters = {
        subjects: [],
        locations: [],
        genders: [],
        lessonTypes: []
    };
    let maxPrice = 70; // 70 = Any

    // 3. AUTOMATED CHECKBOX GENERATOR
    function createCheckboxes(containerId, optionsArray, categoryName) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = optionsArray.map(item => `
            <label class="filter-label">
                <input type="checkbox" value="${item}"> ${item}
            </label>
        `).join('');

        container.querySelectorAll('input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const value = e.target.value;
                if (e.target.checked) {
                    activeFilters[categoryName].push(value);
                } else {
                    activeFilters[categoryName] = activeFilters[categoryName].filter(item => item !== value);
                }
                renderTutors();
            });
        });
    }

    createCheckboxes("subject-filters", filterData.subjects, "subjects");
    createCheckboxes("location-filters", filterData.locations, "locations");
    createCheckboxes("gender-filters", filterData.genders, "genders");
    createCheckboxes("lesson-type-filters", filterData.lessonTypes, "lessonTypes");

    // 4. PRICE SLIDER LOGIC
    if (priceSlider) {
        priceSlider.addEventListener("input", (e) => {
            maxPrice = parseInt(e.target.value);
            priceLabel.innerText = maxPrice >= 70 ? "Any" : "$" + maxPrice;
            renderTutors();
        });
    }

    // NEW: LISTEN FOR SORT DROPDOWN CHANGES
    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            renderTutors(); // Re-render when they pick a new sorting option
        });
    }

    // 5. RENDER TEACHER CARDS
    function renderTutors() {
        if (!listContainer) return;
        listContainer.innerHTML = ""; 

        // A. Filter the Data
        let filteredData = tutorData.filter(tutor => {
            const matchesSub = activeFilters.subjects.length === 0 || tutor.subjects.some(s => activeFilters.subjects.includes(s));
            const matchesLoc = activeFilters.locations.length === 0 || activeFilters.locations.includes(tutor.location);
            const matchesGen = activeFilters.genders.length === 0 || activeFilters.genders.includes(tutor.gender);
            const matchesLes = activeFilters.lessonTypes.length === 0 || tutor.lessonTypes.some(l => activeFilters.lessonTypes.includes(l));
            const matchesPrice = maxPrice >= 70 || tutor.price <= maxPrice;

            return matchesSub && matchesLoc && matchesGen && matchesLes && matchesPrice;
        });

        // B. Sort the Data
        const sortMode = sortSelect ? sortSelect.value : "popularity";
        
        if (sortMode === "popularity") {
            // Sort by students (High to Low)
            filteredData.sort((a, b) => b.students - a.students);
        } else if (sortMode === "price-low") {
            // Sort by price (Low to High)
            filteredData.sort((a, b) => a.price - b.price);
        } else if (sortMode === "price-high") {
            // Sort by price (High to Low)
            filteredData.sort((a, b) => b.price - a.price);
        }

        resultsCount.innerText = `Found the best ${filteredData.length} teachers for you`;

        // C. Draw the Cards
        filteredData.forEach(tutor => {
            const card = document.createElement("div");
            card.className = `adv-card ${tutor.isFounder ? "founder" : ""}`;
            let founderStar = tutor.isFounder ? `<div class="founder-star">⭐</div>` : '';

            const typeTags = tutor.lessonTypes.map(t => `<span class="tag">${t}</span>`).join('');

            card.innerHTML = `
                <div class="adv-col-left">
                    <div class="adv-avatar-wrap">
                        ${founderStar}
                        <img src="${tutor.image}" class="adv-avatar" alt="${tutor.name}">
                    </div>
                    <div class="adv-price">from $${tutor.price}</div>
                    <button class="btn-book-now" onclick="window.location.href='contact.html?teacher=${tutor.name}_${tutor.surnameInitial}'">Book Now</button>
                </div>

                <div class="adv-col-mid">
                    <div class="mid-header">
                        <h3 class="adv-name">${tutor.name} ${tutor.surnameInitial}. <span style="font-size:1rem;font-weight:normal">🤍</span></h3>
                    </div>
                    
                    <div class="adv-stats-row">
                        <div class="stat-item">📍 ${tutor.location}</div>
                        <div class="stat-item" style="color:#fbbf24">★ ${tutor.rating} (${tutor.reviews})</div>
                        <div class="stat-item"><strong>${tutor.students}</strong> Students</div>
                        <div class="stat-item">${typeTags}</div>
                    </div>

                    <div class="text-highlight">${tutor.highlight}</div>

<div style="font-size: 14px !important; font-weight: 700; color: #a78bfa; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 20px; margin-bottom: 10px; text-align: center;">Teaches</div>                    <div class="adv-text-sm">${tutor.subjects.join(', ')}</div>

                    <div class="adv-text-sm" style="margin-top:15px; color:#94a3b8; font-style:italic">
                        "${tutor.bio}"
                    </div>
                </div>

                <div class="adv-col-right" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 20px;">
                    <i class="fa-brands fa-youtube" style="font-size: 3rem; color: #ef4444; margin-bottom: 15px;"></i>
                    <h4 style="color: #fff; margin: 0 0 10px 0; font-size: 1.1rem;">TutorBros Official</h4>
                    <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 20px; line-height: 1.4;">Watch our free tutorials and get to know our teaching style before you book.</p>
                    <a href="https://www.youtube.com/@TutorBrothers" target="_blank" style="background-color: #ef4444; color: white; padding: 10px 15px; border-radius: 8px; text-decoration: none; font-weight: bold; width: 100%; display: block; transition: 0.2s;">
                        Watch Videos
                    </a>
                </div>
            `;
            listContainer.appendChild(card);
        });
    }

    // 6. ACCORDION LOGIC
    document.querySelectorAll('.filter-group-header').forEach(header => {
        header.addEventListener('click', () => {
            header.parentElement.classList.toggle('active');
            header.querySelector('span').innerText = header.parentElement.classList.contains('active') ? '-' : '+';
        });
    });

    // 7. CLEAR ALL LOGIC
    const clearBtn = document.getElementById("clear-filters");
    if (clearBtn) {
        clearBtn.addEventListener("click", (e) => {
            e.preventDefault(); 
            activeFilters = { subjects: [], locations: [], genders: [], lessonTypes: [] };
            maxPrice = 70;
            
            document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
            
            if (priceSlider) {
                priceSlider.value = 70;
                priceLabel.innerText = "Any";
            }
            
            // Reset sort dropdown to Popularity
            if (sortSelect) sortSelect.value = "popularity";

            renderTutors();
        });
    }

    renderTutors();
});