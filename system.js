document.addEventListener('DOMContentLoaded', () => {
    const systemView = document.getElementById('system-view');
    const tooltip = document.getElementById('tooltip');
    // Persistent planet info panel (bottom-right)
    const planetInfoPanel = document.createElement('div');
    planetInfoPanel.id = 'planet-info-panel';
    Object.assign(planetInfoPanel.style, {
        position: 'fixed',
        right: '16px',
        bottom: '16px',
        maxWidth: '360px',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        border: '1px solid #64ffda',
        color: '#fff',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '14px',
        lineHeight: '1.35',
        zIndex: '1002',
        display: 'none',
        pointerEvents: 'auto'
    });
    document.body.appendChild(planetInfoPanel);

    function showPlanetPanel(html) {
        planetInfoPanel.innerHTML = html;
        planetInfoPanel.style.display = 'block';
    }
    function hidePlanetPanel() {
        planetInfoPanel.style.display = 'none';
    }
    // Clicking outside closes the panel
    document.addEventListener('click', (e) => {
        // If click is not inside the panel, hide it
        if (!planetInfoPanel.contains(e.target)) {
            hidePlanetPanel();
        }
    });
    // Prevent clicks inside the panel from bubbling up and closing it
    planetInfoPanel.addEventListener('click', (e) => e.stopPropagation());

    
    // Get the system ID from the URL query parameter
    const params = new URLSearchParams(window.location.search);
    const systemId = params.get('id');

    if (!systemId) {
        systemView.innerHTML = '<p>No system selected. <a href="index.html">Go back to the map</a>.</p>';
        return;
    }

    // Fetch the data and find the correct system
    fetch('galaxy_data.json')
        .then(response => response.json())
        .then(data => {
            const system = data.find(s => s.id === systemId);
            if (!system) {
                systemView.innerHTML = `<p>System with ID ${systemId} not found.</p>`;
                return;
            }
            buildSystemView(system);
        })
        .catch(error => console.error("Error loading system data:", error));

    function buildSystemView(system) {
        // --- Render Star(s) ---
        system.star_data.forEach((star, index) => {
            const starElement = document.createElement('div');
            const starSize = Math.max(10, Math.min(200, Math.log2(star.size + 1) * 15)); // Log scale for size
            starElement.className = 'system-body star ' + star.type.toLowerCase().replace(/\s+/g, '-');
            starElement.style.width = `${starSize}px`;
            starElement.style.height = `${starSize}px`;

            // Position binary stars slightly apart
            if (system.star_data.length > 1) {
                const offset = starSize * 0.7;
                starElement.style.transform = `translateX(${index === 0 ? -offset : offset}px)`;
            }

            addHoverTooltip(starElement, `
                <strong>${star.name} (${star.type})</strong>
                <br>Size: ${star.size} Solar Radii
                <br>Heat: ${star.heat} K
            `);
            systemView.appendChild(starElement);
        });

        // --- Render Planets ---
        system.planets.forEach((planet, index) => {
            const orbitRadius = 100 + index * 60; // Base orbit distance
            const planetSize = Math.max(8, (planet.size * 10)); // Planet size in pixels

            // Create Orbit
            const orbitElement = document.createElement('div');
            orbitElement.className = 'orbit';
            orbitElement.style.width = `${orbitRadius * 2}px`;
            orbitElement.style.height = `${orbitRadius * 2}px`;
            systemView.appendChild(orbitElement);

            // Create Planet
            const planetElement = document.createElement('div');
            planetElement.className = 'system-body planet';
            planetElement.style.width = `${planetSize}px`;
            planetElement.style.height = `${planetSize}px`;
            planetElement.style.backgroundColor = getPlanetColor(planet.type); // Simple color based on type
            
            // Set animation properties
            planetElement.style.setProperty('--orbit-radius', `${orbitRadius}px`);
            planetElement.style.animationDuration = `${20 + index * 15}s`; // Varying orbital periods

            addHoverTooltip(planetElement, `
                <strong>${planet.name} (${planet.type})</strong>
                <br>Size: ${planet.size} Earth Radii
                <br>Materials: ${planet.materials.join(', ')}
                <br>Fact: ${planet.fact}
            `);
            
            // Click to pin details at bottom-right
            planetElement.addEventListener('click', (event) => {
                event.stopPropagation();
                tooltip.style.display = 'none';
                showPlanetPanel(`
                <strong>${planet.name} (${planet.type})</strong>
                <br>Size: ${planet.size} Earth Radii
                <br>Materials: ${planet.materials.join(', ')}
                <br>Fact: ${planet.fact}
            `);
            });
    systemView.appendChild(planetElement);
        });
    }
    
    function addHoverTooltip(element, text) {
        element.addEventListener('mouseover', (event) => {
            tooltip.style.display = 'block';
            tooltip.innerHTML = text;
        });
        element.addEventListener('mousemove', (event) => {
            tooltip.style.left = `${event.pageX + 15}px`;
            tooltip.style.top = `${event.pageY + 15}px`;
        });
        element.addEventListener('mouseout', () => {
            tooltip.style.display = 'none';
        });
    }
    
    function getPlanetColor(type) {
        const colors = {
            "Terrestrial Planet": "#a9a9a9",
            "Gas Giant": "#d2b48c",
            "Ice Giant": "#add8e6",
            "Ocean Planet": "#4682b4",
            "Desert Planet": "#c19a6b",
            "Lava Planet": "#ff4500",
            "Carbon Planet": "#36454f",
            "Habitable Planet": "#3cb371"
        };
        return colors[type] || "#ffffff";
    }
});
