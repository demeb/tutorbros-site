// Start the engine using the All-in-One bundle
tsParticles.load("tsparticles", {
    background: {
        color: { value: "transparent" }, 
    },
    fpsLimit: 120,
    interactivity: {
        events: {
            onHover: {
                enable: true,
                mode: "repulse", 
            },
        },
        modes: {
            repulse: {
                distance: 150, 
                duration: 0.4,
            },
        },
    },
    particles: {
        color: {
            value: "#a78bfa", // TutorBros Purple
        },
        links: {
            color: "#a78bfa",
            distance: 150,
            enable: true,
            opacity: 0.3,
            width: 1,
        },
        move: {
            direction: "none",
            enable: true,
            outModes: { default: "bounce" },
            random: false,
            speed: 1, 
            straight: false,
        },
        number: {
            density: { enable: true, area: 800 },
            value: 80, 
        },
        opacity: { value: 0.5 },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
});