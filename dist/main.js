"use strict";
// src/main.ts
// --- Network Canvas Animation ---
const canvas = document.getElementById('network-canvas');
const ctx = canvas.getContext('2d');
let canvasNodes = [];
// General parameters to configure
const nodeDensity = 0.00008; // Nodes per square pixel 
const maxNodes = 600; // Maximum number of nodes
const minNodes = 10; // Minimum number of nodes
const nodeRadius = 3; // Radius of nodes
const nodeBaseSpeed = 0.35; // Base speed of nodes
const nodeAttractionForce = 0.006; // Attraction force between nodes
const nodeRepelForce = 0.005; // Repel force between nodes
const nodeRepelDistance = 180; // Distance where nodes repel each other
const connectDistance = 200; // Distance where nodes connect
const mouseRadius = 60; // Radius around the mouse where nodes repel
const mouseRepelForce = 0.3; // Repel force when mouse is close
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
        ctx.fillStyle = 'rgba(150, 150, 150, 1)';
        ctx.fill();
    }
    update() {
        // Interaction with mouse (repulsion)
        if (mouse.x !== null && mouse.y !== null) {
            const dxMouse = this.x - mouse.x;
            const dyMouse = this.y - mouse.y;
            const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
            if (distMouse < mouseRadius) {
                const forceX = dxMouse / distMouse;
                const forceY = dyMouse / distMouse;
                const repelStrength = (1 - distMouse / mouseRadius) * mouseRepelForce;
                this.vx += forceX * repelStrength;
                this.vy += forceY * repelStrength;
            }
        }
        // Drifting behaviour
        this.vx += (this.baseVx - this.vx) * 0.01;
        this.vy += (this.baseVy - this.vy) * 0.01;
        // Update position based on current velocity
        this.x += this.vx;
        this.y += this.vy;
        // Check for collision with canvas in the X direction
        if (this.x < this.radius || this.x > canvas.width - this.radius) {
            this.vx *= -1;
            this.x = Math.max(this.radius, Math.min(this.x, canvas.width - this.radius));
            this.baseVx *= -1; // Reverse the base horizontal speed
        }
        // Check for collision with canvas in the Y direction
        if (this.y < this.radius || this.y > canvas.height - this.radius) {
            this.vy *= -1;
            this.y = Math.max(this.radius, Math.min(this.y, canvas.height - this.radius));
            this.baseVy *= -1; // Reverse the base vertical speed
        }
    }
}
function initCanvas() {
    if (!canvas || !ctx)
        return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Calculate number of nodes based on canvas area
    const canvasArea = canvas.width * canvas.height;
    let numNodes = Math.round(canvasArea * nodeDensity); // Calculate based on density
    numNodes = Math.max(minNodes, numNodes); // Ensure minimum
    numNodes = Math.min(maxNodes, numNodes); // Ensure maximum
    canvasNodes = []; // Clear canvas nodes array
    // Create nodes with random positions
    for (let i = 0; i < numNodes; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        canvasNodes.push(new CanvasNode(x, y, nodeRadius));
    }
}
function connectNodes() {
    if (!ctx)
        return;
    let nodeA, nodeB;
    // Iterate through all unique pairs of nodes
    for (let i = 0; i < canvasNodes.length; i++) {
        nodeA = canvasNodes[i];
        for (let j = i + 1; j < canvasNodes.length; j++) {
            nodeB = canvasNodes[j];
            const dx = nodeA.x - nodeB.x;
            const dy = nodeA.y - nodeB.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            // Check if nodes are close enough to interact or connect
            if (distance < connectDistance) {
                // Draw connection line if within connect distance
                const opacity = 1 - distance / connectDistance;
                ctx.beginPath();
                ctx.moveTo(nodeA.x, nodeA.y);
                ctx.lineTo(nodeB.x, nodeB.y);
                // Use a subtle color for the connection lines
                ctx.strokeStyle = `rgba(100, 100, 100, ${opacity * 0.4})`;
                ctx.lineWidth = 1;
                ctx.stroke();
                // --- Added Node Interaction Logic ---
                if (distance > 0) { // Avoid division by zero if nodes overlap perfectly
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    // Repulsion if too close
                    if (distance < nodeRepelDistance) {
                        const repelStrength = (1 - distance / nodeRepelDistance) * nodeRepelForce;
                        // Apply force to push nodes apart
                        nodeA.vx += forceDirectionX * repelStrength;
                        nodeA.vy += forceDirectionY * repelStrength;
                        nodeB.vx -= forceDirectionX * repelStrength;
                        nodeB.vy -= forceDirectionY * repelStrength;
                    }
                    // Attraction if close, but not too close
                    else {
                        const attractStrength = (1 - distance / (connectDistance)) * nodeAttractionForce;
                        // Apply force to pull nodes together
                        nodeA.vx -= forceDirectionX * attractStrength;
                        nodeA.vy -= forceDirectionY * attractStrength;
                        nodeB.vx += forceDirectionX * attractStrength;
                        nodeB.vy += forceDirectionY * attractStrength;
                    }
                }
                // --- End of Node Interaction Logic ---
            }
        }
    }
}
function animate() {
    if (!ctx)
        return;
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    connectNodes(); // Draw connections between nodes
    canvasNodes.forEach(node => {
        node.update();
        node.draw();
    });
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
                emailSpan.textContent = 'Copied to clipboard!';
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
