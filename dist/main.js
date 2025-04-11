"use strict";
// src/main.ts
console.log("Bogi Syderbø's personal website script loaded.");
// --- Network Canvas Animation ---
const canvas = document.getElementById('network-canvas');
const ctx = canvas.getContext('2d');
let canvasNodes = [];
const numNodes = 80;
const connectDistance = 220;
const mouseRadius = 60;
const nodeBaseSpeed = 0.3;
const nodeRepelForce = 0.3;
const nodeRadius = 4;
let mouse = {
    x: null,
    y: null
};
class CanvasNode {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.baseVx = (Math.random() - 0.5) * nodeBaseSpeed * 2;
        this.baseVy = (Math.random() - 0.5) * nodeBaseSpeed * 2;
        this.vx = this.baseVx;
        this.vy = this.baseVy;
    }
    draw() {
        if (!ctx)
            return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fill();
    }
    update() {
        // Interaction with mouse
        if (mouse.x !== null && mouse.y !== null) {
            const dxMouse = this.x - mouse.x;
            const dyMouse = this.y - mouse.y;
            const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
            if (distMouse < mouseRadius) {
                const forceX = dxMouse / distMouse;
                const forceY = dyMouse / distMouse;
                const repelStrength = (1 - distMouse / mouseRadius) * nodeRepelForce;
                this.vx += forceX * repelStrength;
                this.vy += forceY * repelStrength;
            }
        }
        this.vx += (this.baseVx - this.vx) * 0.01;
        this.vy += (this.baseVy - this.vy) * 0.01;
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < this.radius || this.x > canvas.width - this.radius) {
            this.vx *= -1;
            this.x = Math.max(this.radius, Math.min(this.x, canvas.width - this.radius));
            this.baseVx *= -1;
        }
        if (this.y < this.radius || this.y > canvas.height - this.radius) {
            this.vy *= -1;
            this.y = Math.max(this.radius, Math.min(this.y, canvas.height - this.radius));
            this.baseVy *= -1;
        }
    }
}
function initCanvas() {
    if (!canvas || !ctx)
        return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvasNodes = [];
    for (let i = 0; i < numNodes; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        canvasNodes.push(new CanvasNode(x, y, nodeRadius));
    }
}
function connectNodes() {
    if (!ctx)
        return;
    for (let i = 0; i < canvasNodes.length; i++) {
        for (let j = i + 1; j < canvasNodes.length; j++) {
            const dx = canvasNodes[i].x - canvasNodes[j].x;
            const dy = canvasNodes[i].y - canvasNodes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < connectDistance) {
                const opacity = 1 - distance / connectDistance;
                ctx.beginPath();
                ctx.moveTo(canvasNodes[i].x, canvasNodes[i].y);
                ctx.lineTo(canvasNodes[j].x, canvasNodes[j].y);
                ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.3})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
}
function animate() {
    if (!ctx)
        return;
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvasNodes.forEach(node => {
        node.update();
        node.draw();
    });
    connectNodes();
}
// Event Listeners
window.addEventListener('resize', initCanvas);
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});
initCanvas();
animate();
// --- End Network Canvas Animation ---
// --- Existing DOMContentLoaded Logic ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded.");
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear().toString();
    }
    else {
        console.error("Element with ID 'current-year' not found.");
    }
    const emailSpan = document.querySelector('.profile-info .email');
    if (emailSpan) {
        emailSpan.setAttribute('title', 'Click to copy email');
        emailSpan.addEventListener('click', () => {
            const email = emailSpan.textContent || '';
            if (!email)
                return;
            navigator.clipboard.writeText(email)
                .then(() => {
                const originalText = emailSpan.textContent; // Store the original text
                emailSpan.textContent = 'Copied!';
                setTimeout(() => {
                    // Check if the element still exists before setting text back
                    const currentEmailSpan = document.querySelector('.profile-info .email');
                    if (currentEmailSpan)
                        currentEmailSpan.textContent = originalText;
                }, 1500);
            })
                .catch(err => {
                console.error('Failed to copy email: ', err);
            });
        });
    }
    else {
        console.error("Element with class '.profile-info .email' not found.");
    }
});
// --- End DOMContentLoaded ---
