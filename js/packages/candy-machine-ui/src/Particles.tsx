import Particles from "react-tsparticles";
import './App.css';

export default function Particle() {
    return (
        <Particles className="particle"
            options={{
                fpsLimit: 120,
                interactivity: {
                events: {
                    onClick: {
                    enable: true,
                    mode: "push",
                    },
                    onHover: {
                    enable: true,
                    mode: "repulse",
                    },
                    resize: true,
                },
                modes: {
                    bubble: {
                    distance: 400,
                    duration: 2,
                    size: 40,
                    },
                    push: {
                    quantity: 4,
                    },
                    repulse: {
                    distance: 100,
                    duration: 0.4,
                    },
                },
                },
                particles: {
                zIndex:{
                    value: -10,
                },
                color: {
                    value: "#ffffff",
                },
                collisions: {
                    enable: true,
                },
                move: {
                    direction: "none",
                    enable: true,
                    outMode: "bounce",
                    random: false,
                    speed: 0.5,
                    straight: false,
                },
                number: {
                    density: {
                    enable: true,
                    area: 800,
                    },
                    value: 180,
                },
                opacity: {
                    value: 0.5,
                },
                shape: {
                    type: "star",
                },
                size: {
                    random: true,
                    value: 1,
                },
                
                },
                detectRetina: true,
            }}
    />
    )
}