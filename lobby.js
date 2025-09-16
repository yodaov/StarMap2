document.addEventListener('DOMContentLoaded', () => {
    const galaxyMap = document.getElementById('galaxy-map');
    const tooltip = document.getElementById('tooltip');

    // Fetch the star system data
    fetch('galaxy_data.json')
        .then(response => response.json())
        .then(data => {
            // Function to convert star type to a CSS class
            const getTypeClass = (type) => {
                return type.toLowerCase().replace(/\s+/g, '-');
            };

            // Create and place each star on the map
            data.forEach(system => {
                const starElement = document.createElement('div');
                starElement.classList.add('star', getTypeClass(system.type));
                starElement.style.left = system.position.x;
                starElement.style.top = system.position.y;
                starElement.dataset.id = system.id;

                // Event listener for hover to show tooltip
                starElement.addEventListener('mouseover', (event) => {
                    tooltip.style.display = 'block';
                    tooltip.innerHTML = `<strong>${system.name}</strong><br>Type: ${system.type}`;
                });
                
                // Move tooltip with mouse
                starElement.addEventListener('mousemove', (event) => {
                    tooltip.style.left = `${event.pageX + 15}px`;
                    tooltip.style.top = `${event.pageY + 15}px`;
                });

                // Hide tooltip on mouse out
                starElement.addEventListener('mouseout', () => {
                    tooltip.style.display = 'none';
                });

                // Event listener for click to go to system view
                starElement.addEventListener('click', () => {
                    window.location.href = `system.html?id=${system.id}`;
                });

                galaxyMap.appendChild(starElement);
            });
        })
        .catch(error => console.error("Error loading galaxy data:", error));
});
