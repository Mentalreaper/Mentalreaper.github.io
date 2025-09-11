let effectsData = [];
let durationsData = [];

let isSpinning = false;

// Zoom and pan variables
let zoomLevel = 1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 50;  // Massively increased for ultra detail
const ZOOM_SPEED = 0.001;
let isPanning = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;

// Detail levels
const DETAIL_LEVEL_1 = 2;     // Show 100 segments
const DETAIL_LEVEL_2 = 5;     // Show groups of 10
const DETAIL_LEVEL_3 = 15;    // Show individual slots
const DETAIL_LEVEL_4 = 30;    // Ultra detail with clear separation

// Currently displayed slots
let currentSlots = [];
let slotTooltip = null;
let currentHoveredSlot = null;

// Mouse position for slot detection
let mouseAngle = 0;
let mouseRadius = 0;

// Load data from external files
async function loadData()
{
    try
    {
        // Create mock data if files don't exist (for testing)
        try
        {
            const [effectsResponse, durationsResponse] = await Promise.all
            ([
                fetch('./data/effects.json'),
                fetch('./data/durations.json')
            ]);
            
            effectsData = await effectsResponse.json();
            durationsData = await durationsResponse.json();
        }
        catch (e)
        {
            console.log('Using mock data for testing');

            // Generate mock data for testing
            effectsData = [];
            for (let i = 1; i <= 10000; i++)
            {
                effectsData.push
                ({
                    roll: i,
                    effect: `Effect #${i}: ${generateMockEffect(i)}`,
                    has_condition: Math.random() > 0.7 ? "True" : "False"
                });
            }
            
            durationsData = [];
            for (let i = 1; i <= 100; i++)
            {
                durationsData.push
                ({
                    roll: i,
                    effect: `Condition #${i}: ${generateMockCondition(i)}`
                });
            }
        }
        
        // Initialize the wheel numbers after data is loaded
        addWheelNumbers();
        
        // Enable the spin button
        document.getElementById('spinButton').disabled = false;
        document.getElementById('spinButton').textContent = 'SPIN';
        
    } 
    catch (error)
    {
        console.error('Error loading data:', error);
        document.getElementById('spinButton').textContent = 'Error Loading Data';
    }
}

// Generate mock effects for testing
function generateMockEffect(roll)
{
    const effects =
    [
        "Target has visions of the future involving no-one they recognize",
        "All metal within 30ft becomes magnetic",
        "Target's shadow acts independently",
        "Gravity reverses in a 10ft radius",
        "Target can only speak in rhymes",
        "All creatures within 20ft swap voices",
        "Target becomes invisible when they close their eyes",
        "Rain follows the target for 24 hours",
        "Target's footsteps leave flowers",
        "All text appears backwards to the target"
    ];

    return effects[roll % effects.length];
}

function generateMockCondition(roll)
{
    const conditions =
    [
        "Kiss a frog",
        "Sing a complete song",
        "Tell three truths",
        "Make someone laugh",
        "Walk backwards for a mile"
    ];

    return conditions[roll % conditions.length];
}

// Add wheel numbers
function addWheelNumbers()
{
    const mainNumbers = document.getElementById('mainWheelNumbers');
    const radius = 330;
    const centerX = 350;
    const centerY = 350;
    
    // Main wheel - show every 1000
    for (let i = 0; i < 10; i++)
    {
        const angle = (i * 36 - 90) * Math.PI / 180;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        const number = document.createElement('div');
        number.className = 'wheel-number main-thousand';
        number.style.left = x - 20 + 'px';
        number.style.top = y - 10 + 'px';
        number.textContent = ((i + 1) * 1000);
        mainNumbers.appendChild(number);
    }
    
    // Add 100s markers (smaller, inner ring)
    for (let i = 0; i < 100; i++)
    {
        // Skip thousands
        if (i % 10 === 0)
        {
            continue;
        }
        
        const angle = (i * 3.6 - 90) * Math.PI / 180;
        const x = centerX + (radius - 30) * Math.cos(angle);
        const y = centerY + (radius - 30) * Math.sin(angle);
        
        const number = document.createElement('div');
        number.className = 'wheel-number main-hundred';
        number.style.left = x - 15 + 'px';
        number.style.top = y - 8 + 'px';
        number.style.fontSize = '10px';
        number.style.opacity = '0';
        number.textContent = (i * 100);
        mainNumbers.appendChild(number);
    }
    
    // Add numbers to condition wheel
    const condNumbers = document.getElementById('conditionWheelNumbers');
    const condRadius = 160;
    const condCenterX = 175;
    const condCenterY = 175;
    
    for (let i = 0; i < 20; i++)
    {
        const angle = (i * 18 - 90) * Math.PI / 180;
        const x = condCenterX + condRadius * Math.cos(angle);
        const y = condCenterY + condRadius * Math.sin(angle);
        
        const number = document.createElement('div');
        number.className = 'wheel-number';
        number.style.left = x - 15 + 'px';
        number.style.top = y - 10 + 'px';
        number.textContent = (i + 1) * 5;
        condNumbers.appendChild(number);
    }
}

// Calculate which slot the mouse is over
function getSlotFromMousePosition(x, y)
{
    const mainWheel = document.getElementById('mainWheel');
    const rect = mainWheel.getBoundingClientRect();
    const wheelCenterX = rect.left + rect.width / 2;
    const wheelCenterY = rect.top + rect.height / 2;
    
    // Calculate angle from wheel center
    const dx = x - wheelCenterX;
    const dy = y - wheelCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if mouse is over the wheel
    const wheelRadius = (rect.width / 2);
    if (distance > wheelRadius || distance < wheelRadius * 0.3)
    {
        return null;
    }
    
    // Calculate angle (0-360)
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    angle = (angle + 90 + 360) % 360; // Adjust for top start position
    
    // Account for wheel rotation
    const wheelTransform = mainWheel.style.transform;
    const rotateMatch = wheelTransform.match(/rotate\(([\d.]+)deg\)/);
    if (rotateMatch)
    {
        const wheelRotation = parseFloat(rotateMatch[1]);
        angle = (angle - wheelRotation % 360 + 360) % 360;
    }
    
    // Calculate slot number (1-10000)
    const slot = Math.floor(angle / 0.036) + 1;
    return Math.min(Math.max(slot, 1), 10000);
}

// Create visual slot segments for ultra zoom
function createVisualSlots()
{
    const mainWheel = document.getElementById('mainWheel');
    
    // Remove existing visual slots
    const existingSlots = mainWheel.querySelector('.visual-slots');
    if (existingSlots)
    {
        existingSlots.remove();
    }
    
    if (zoomLevel < DETAIL_LEVEL_3)
    {
        return;
    }
    
    const slotsContainer = document.createElement('div');
    slotsContainer.className = 'visual-slots';
    
    // Calculate visible range based on current view
    const centerX = 350;
    const centerY = 350;
    const radius = 350;
    
    // Determine how many slots to show based on zoom
    let slotGroupSize = 100;
    if (zoomLevel >= DETAIL_LEVEL_4)
    {
        slotGroupSize = 1; // Show individual slots
    }
    else if (zoomLevel >= DETAIL_LEVEL_3)
    {
        slotGroupSize = 10; // Show groups of 10
    }
    
    // Calculate visible arc
    const visibleArc = 360 / Math.max(zoomLevel / 2, 1);
    const startAngle = -visibleArc / 2;
    const endAngle = visibleArc / 2;
    
    // Only render visible slots
    const startSlot = Math.max(1, Math.floor(startAngle / 0.036));
    const endSlot = Math.min(10000, Math.ceil(endAngle / 0.036));
    
    for (let i = startSlot; i <= endSlot; i += slotGroupSize)
    {
        const slotAngle = (i - 1) * 0.036;
        const slotEndAngle = Math.min((i + slotGroupSize - 1) * 0.036, 360);
        
        // Create visual segment
        const segment = document.createElement('div');
        segment.className = 'visual-slot';
        segment.dataset.slotStart = i;
        segment.dataset.slotEnd = Math.min(i + slotGroupSize - 1, 10000);
        
        // Calculate segment position and size
        const startRad = slotAngle * Math.PI / 180 - Math.PI / 2;
        const endRad = slotEndAngle * Math.PI / 180 - Math.PI / 2;
        
        // Create SVG path for the segment
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.width = '700px';
        svg.style.height = '700px';
        svg.style.pointerEvents = 'none';
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const innerRadius = radius * 0.4;
        const outerRadius = radius;
        
        const x1 = centerX + innerRadius * Math.cos(startRad);
        const y1 = centerY + innerRadius * Math.sin(startRad);
        const x2 = centerX + outerRadius * Math.cos(startRad);
        const y2 = centerY + outerRadius * Math.sin(startRad);
        const x3 = centerX + outerRadius * Math.cos(endRad);
        const y3 = centerY + outerRadius * Math.sin(endRad);
        const x4 = centerX + innerRadius * Math.cos(endRad);
        const y4 = centerY + innerRadius * Math.sin(endRad);
        
        const largeArc = (slotEndAngle - slotAngle) > 180 ? 1 : 0;
        
        const d = `
            M ${x1} ${y1}
            L ${x2} ${y2}
            A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3}
            L ${x4} ${y4}
            A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1}
        `;
        
        path.setAttribute('d', d);
        path.setAttribute('fill', 'transparent');
        path.setAttribute('stroke', 'rgba(255, 215, 0, 0.1)');
        path.setAttribute('stroke-width', '0.5');
        
        svg.appendChild(path);
        slotsContainer.appendChild(svg);
    }
    
    mainWheel.appendChild(slotsContainer);
}

// Show slot tooltip
function showSlotTooltip(slotNumber, x, y)
{
    if (!effectsData || effectsData.length === 0)
    {
        return;
    }
    
    const effect = effectsData.find(e => e.roll === slotNumber);

    if (!effect)
    {
        return;
    }
    
    if (!slotTooltip)
    {
        slotTooltip = document.createElement('div');
        slotTooltip.className = 'slot-tooltip';
        document.body.appendChild(slotTooltip);
    }
    
    const hasCondition = effect.has_condition === "True";
    let conditionHTML = '';
    
    if (hasCondition)
    {
        conditionHTML = '<div class="tooltip-condition">Has removal condition</div>';
    }
    
    slotTooltip.innerHTML = `
        <div class="tooltip-number">#${slotNumber}</div>
        <div class="tooltip-effect">${effect.effect}</div>
        ${conditionHTML}
    `;
    
    // Position tooltip near cursor
    const tooltipRect = slotTooltip.getBoundingClientRect();
    let left = x + 15;
    let top = y - tooltipRect.height / 2;
    
    // Keep tooltip on screen
    if (left + tooltipRect.width > window.innerWidth)
    {
        left = x - tooltipRect.width - 15;
    }

    if (top < 10)
    {
        top = 10;
    }

    if (top + tooltipRect.height > window.innerHeight - 10)
    {
        top = window.innerHeight - tooltipRect.height - 10;
    }
    
    slotTooltip.style.left = left + 'px';
    slotTooltip.style.top = top + 'px';
    
    setTimeout(() =>
    {
        slotTooltip.classList.add('visible');
    }, 10);
    
    currentHoveredSlot = slotNumber;
}

// Hide slot tooltip
function hideSlotTooltip()
{
    if (slotTooltip)
    {
        slotTooltip.classList.remove('visible');
        currentHoveredSlot = null;
    }
}

// Initialize zoom and pan functionality
function initializeZoomPan()
{
    const zoomContainer = document.getElementById('zoomContainer');
    const wheelsContainer = document.getElementById('wheelsContainer');
    
    // Track mouse movement for slot detection
    zoomContainer.addEventListener('mousemove', (e) =>
    {
        if (zoomLevel >= DETAIL_LEVEL_3 && !isPanning && !isSpinning)
        {
            const slot = getSlotFromMousePosition(e.clientX, e.clientY);
            
            if (slot && slot !== currentHoveredSlot)
            {
                showSlotTooltip(slot, e.clientX, e.clientY);
            }
            else if (!slot && currentHoveredSlot)
            {
                hideSlotTooltip();
            }
        }
        else
        {
            hideSlotTooltip();
        }
    });
    
    zoomContainer.addEventListener('mouseleave', () =>
    {
        hideSlotTooltip();
    });
    
    // Mouse wheel zoom
    zoomContainer.addEventListener('wheel', (e) =>
    {
        e.preventDefault();
        
        const delta = e.deltaY * -ZOOM_SPEED;
        const newZoom = Math.min(Math.max(zoomLevel + delta, MIN_ZOOM), MAX_ZOOM);
        
        // Calculate zoom point (mouse position)
        const rect = zoomContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate the point on the container before zoom
        const pointX = (x - rect.width / 2 - translateX) / zoomLevel;
        const pointY = (y - rect.height / 2 - translateY) / zoomLevel;
        
        // Update zoom
        zoomLevel = newZoom;
        
        // Calculate new translation to keep the point under the mouse
        translateX = x - rect.width / 2 - pointX * zoomLevel;
        translateY = y - rect.height / 2 - pointY * zoomLevel;
        
        updateTransform();
    });
    
    // Mouse drag to pan
    zoomContainer.addEventListener('mousedown', (e) =>
    {
        // Left click only
        if (e.button === 0)
        {
            isPanning = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            zoomContainer.style.cursor = 'grabbing';
            hideSlotTooltip();
        }
    });
    
    document.addEventListener('mousemove', (e) =>
    {
        if (!isPanning)
        {
            return;
        }
        
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateTransform();
    });
    
    document.addEventListener('mouseup', () =>
    {
        isPanning = false;
        const zoomContainer = document.getElementById('zoomContainer');
        if (zoomContainer)
        {
            zoomContainer.style.cursor = 'grab';
        }
    });
    
    // Touch support for mobile
    let touchStartDistance = 0;
    let touchStartZoom = 1;
    
    zoomContainer.addEventListener('touchstart', (e) =>
    {
        if (e.touches.length === 2)
        {
            // Pinch zoom
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            touchStartDistance = Math.hypot
            (
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            touchStartZoom = zoomLevel;
        }
        else if (e.touches.length === 1)
        {
            // Pan
            isPanning = true;
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
        }
    });
    
    zoomContainer.addEventListener('touchmove', (e) =>
    {
        e.preventDefault();
        
        if (e.touches.length === 2)
        {
            // Pinch zoom
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot
            (
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            const scale = currentDistance / touchStartDistance;
            zoomLevel = Math.min(Math.max(touchStartZoom * scale, MIN_ZOOM), MAX_ZOOM);
            updateTransform();
        }
        else if (e.touches.length === 1 && isPanning)
        {
            // Pan
            translateX = e.touches[0].clientX - startX;
            translateY = e.touches[0].clientY - startY;
            updateTransform();
        }
    });
    
    zoomContainer.addEventListener('touchend', () =>
    {
        isPanning = false;
    });
    
    // Double click to reset zoom
    zoomContainer.addEventListener('dblclick', () =>
    {
        zoomLevel = 1;
        translateX = 0;
        translateY = 0;
        updateTransform();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) =>
    {
        if (e.key === '=' || e.key === '+')
        {
            zoomLevel = Math.min(zoomLevel * 1.2, MAX_ZOOM);
            updateTransform();
        }
        else if (e.key === '-' || e.key === '_')
        {
            zoomLevel = Math.max(zoomLevel / 1.2, MIN_ZOOM);
            updateTransform();
        }
        else if (e.key === '0')
        {
            zoomLevel = 1;
            translateX = 0;
            translateY = 0;
            updateTransform();
        }
    });
}

// Update transform
function updateTransform()
{
    const wheelsContainer = document.getElementById('wheelsContainer');
    wheelsContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`;
    
    // Update number visibility based on zoom
    const hundreds = document.querySelectorAll('.main-hundred');
    hundreds.forEach(num =>
    {
        num.style.opacity = zoomLevel >= DETAIL_LEVEL_1 ? '0.7' : '0';
    });
    
    // Update zoom hint
    const hint = document.querySelector('.zoom-hint');
    if (zoomLevel >= DETAIL_LEVEL_4)
    {
        hint.textContent = `Ultra Zoom (${Math.round(zoomLevel)}x) • Hover over slots to see effects • Double-click to reset`;
    } 
    else if (zoomLevel >= DETAIL_LEVEL_3)
    {
        hint.textContent = `High Zoom (${Math.round(zoomLevel)}x) • Keep zooming to see individual slots • Double-click to reset`;
    } 
    else if (zoomLevel >= DETAIL_LEVEL_2)
    {
        hint.textContent = `Medium Zoom (${Math.round(zoomLevel)}x) • Zoom more for slot details • Double-click to reset`;
    }
    else if (zoomLevel >= DETAIL_LEVEL_1)
    {
        hint.textContent = `Zoomed In (${Math.round(zoomLevel)}x) • Keep zooming to see segments • Double-click to reset`;
    }
    else
    {
        hint.textContent = 'Scroll to zoom • Drag to pan • Double-click to reset • Keys: +/- to zoom, 0 to reset';
    }
    
    // Update visual slots
    createVisualSlots();
}

// Create sparkle effect
function createSparkle(x, y)
{
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.textContent = '✨';
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    sparkle.style.fontSize = Math.random() * 20 + 10 + 'px';
    document.body.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 1000);
}

// Spin the wheel
function spin()
{
    if (isSpinning)
    {
        return;
    }
    
    isSpinning = true;
    document.getElementById('spinButton').disabled = true;
    document.getElementById('resultCard').classList.remove('show');
    
    // Hide tooltip
    hideSlotTooltip();
    
    // Reset zoom for better view of spinning
    if (zoomLevel !== 1)
    {
        zoomLevel = 1;
        translateX = 0;
        translateY = 0;
        updateTransform();
    }
    
    // Create sparkles around button
    const button = document.getElementById('spinButton');
    const rect = button.getBoundingClientRect();
    for (let i = 0; i < 10; i++)
    {
        setTimeout(() =>
        {
            createSparkle
            (
                rect.left + Math.random() * rect.width,
                rect.top + Math.random() * rect.height
            );
        }, i * 100);
    }
    
    // Generate random number between 1 and 10000
    const randomRoll = Math.floor(Math.random() * 10000) + 1;
    
    // Get the effect
    const effect = effectsData.find(e => e.roll === randomRoll) || effectsData[0];
    const hasCondition = effect.has_condition === "True";
    
    // Calculate main wheel rotation
    // Each slot is 0.036 degrees (360/10000)
    const targetAngle = ((randomRoll - 1) * 0.036);
    const baseRotation = 360 * 8; // 8 full rotations for drama
    const finalRotation = baseRotation + targetAngle;
    
    // Reset and spin main wheel
    const mainWheel = document.getElementById('mainWheel');
    mainWheel.style.transition = 'none';
    mainWheel.style.transform = 'rotate(0deg)';
    
    setTimeout(() =>
    {
        mainWheel.style.transition = 'transform 5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        mainWheel.style.transform = `rotate(${finalRotation}deg)`;
    }, 50);
    
    // Handle condition wheel if needed
    if (hasCondition)
    {
        setTimeout(() =>
        {
            document.getElementById('conditionWheelWrapper').classList.add('active');
            
            const conditionRoll = Math.floor(Math.random() * 100) + 1;
            const condition = durationsData.find(d => d.roll === conditionRoll) || durationsData[0];
            
            const conditionSegmentAngle = 18; // 360/20
            const conditionTargetAngle = ((conditionRoll - 1) % 20) * conditionSegmentAngle;
            const conditionBaseRotation = 360 * 5;
            const conditionFinalRotation = conditionBaseRotation + conditionTargetAngle;
            
            const conditionWheel = document.getElementById('conditionWheel');
            conditionWheel.style.transition = 'none';
            conditionWheel.style.transform = 'rotate(0deg)';
            
            setTimeout(() =>
            {
                conditionWheel.style.transition = 'transform 4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                conditionWheel.style.transform = `rotate(${conditionFinalRotation}deg)`;
            }, 50);
            
            setTimeout(() =>
            {
                showResult(randomRoll, effect.effect, condition.effect);
            }, 4000);
        }, 2000);
    }
    else
    {
        document.getElementById('conditionWheelWrapper').classList.remove('active');
        setTimeout(() =>
        {
            showResult(randomRoll, effect.effect, null);
        }, 5000);
    }
}

// Show result
function showResult(roll, effectText, conditionText)
{
    document.getElementById('rollNumber').textContent = `#${roll.toLocaleString()}`;
    document.getElementById('effectText').textContent = effectText;
    
    if (conditionText)
    {
        document.getElementById('conditionSection').style.display = 'block';
        document.getElementById('conditionText').textContent = conditionText;
    }
    else
    {
        document.getElementById('conditionSection').style.display = 'none';
    }
    
    document.getElementById('resultCard').classList.add('show');
    
    // Create celebration sparkles
    const card = document.getElementById('resultCard');
    const rect = card.getBoundingClientRect();
    
    document.getElementById('spinButton').disabled = false;
    isSpinning = false;
}

// Initialize
document.getElementById('spinButton').addEventListener('click', spin);

// Call loadData when page loads
window.addEventListener('DOMContentLoaded', () =>
{
    // Disable button initially
    document.getElementById('spinButton').disabled = true;
    document.getElementById('spinButton').textContent = 'Loading Magic...';
    
    // Initialize zoom and pan
    initializeZoomPan();
    
    // Load the data
    loadData();
});