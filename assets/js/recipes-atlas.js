// Recipe atlas: a 3D globe with one map pin per recipe origin.
// Loaded on demand by recipes.js, so three.js and the land geometry are
// only downloaded when the visitor opens the atlas.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/+esm';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js/+esm';
import { feature } from 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm';

// 1:50m land for the first view; the 1:10m coastline is swapped in once the visitor zooms close.
const LAND_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-50m.json';
const LAND_DETAIL_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-10m.json';
const DETAIL_DISTANCE = 1.8;
const ACCENT = '#e8b581';
const OCEAN = '#15212a';
const RADIUS = 1;
const START_DISTANCE = 3.3;

function toVector(lat, lon, radius = RADIUS) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

async function loadRings(url) {
    const topology = await (await fetch(url)).json();
    const land = feature(topology, topology.objects.land);
    return land.features
        .flatMap(f => f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates)
        .flat();
}

// Equirectangular fill: dark ocean, graticule and warm land. The coastline
// itself is drawn as vector lines on top, so it stays sharp at any zoom.
function globeTexture(rings) {
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    const x = lon => (lon + 180) / 360 * canvas.width;
    const y = lat => (90 - lat) / 180 * canvas.height;

    ctx.fillStyle = OCEAN;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(232, 181, 129, 0.10)';
    ctx.lineWidth = 2;
    for (let lon = -180; lon <= 180; lon += 15) {
        ctx.beginPath(); ctx.moveTo(x(lon), 0); ctx.lineTo(x(lon), canvas.height); ctx.stroke();
    }
    for (let lat = -75; lat <= 75; lat += 15) {
        ctx.beginPath(); ctx.moveTo(0, y(lat)); ctx.lineTo(canvas.width, y(lat)); ctx.stroke();
    }

    ctx.beginPath();
    for (const ring of rings) {
        let previousLon = null;
        ring.forEach(([lon, lat], i) => {
            // Break rings that wrap the antimeridian instead of drawing a stripe across the map.
            if (i === 0 || Math.abs(lon - previousLon) > 180) ctx.moveTo(x(lon), y(lat));
            else ctx.lineTo(x(lon), y(lat));
            previousLon = lon;
        });
        ctx.closePath();
    }
    ctx.fillStyle = '#5a4634';
    ctx.fill('evenodd');

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
}

function coastlineGeometry(rings) {
    const positions = [];
    for (const ring of rings) {
        for (let i = 1; i < ring.length; i++) {
            const [lon0, lat0] = ring[i - 1];
            const [lon1, lat1] = ring[i];
            if (Math.abs(lon1 - lon0) > 180) continue;
            positions.push(...toVector(lat0, lon0, RADIUS * 1.0004).toArray(), ...toVector(lat1, lon1, RADIUS * 1.0004).toArray());
        }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
}

// Zoomed out, a place with several recipes shows one big pin; zoomed in,
// it fans out into one pin per recipe.
const EXPAND_DISTANCE = 1.9;
const FAN_RADIUS = 0.045;

// `entries` are the recipes behind this pin: several for a place pin, one for a recipe pin.
// `slot` places a recipe pin in its place's fan.
function makePin(place, entries, slot = null) {
    const pin = new THREE.Group();
    const marker = new THREE.Group();
    const needle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0035, 0.0012, 0.11, 8),
        new THREE.MeshStandardMaterial({ color: 0xc9ced2, metalness: 0.9, roughness: 0.25 })
    );
    needle.position.y = 0.055;
    const headSize = Math.min(1 + (entries.length - 1) * 0.12, 1.7);
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.017 * headSize, 20, 16),
        new THREE.MeshStandardMaterial({ color: 0xd8262b, metalness: 0.2, roughness: 0.3, emissive: 0x000000 })
    );
    head.position.y = 0.11 + 0.017 * headSize * 0.6;
    // The "x" marking the spot, drawn flat on the surface.
    const crossMaterial = new THREE.MeshBasicMaterial({ color: 0xd8262b, transparent: true, opacity: 0.85 });
    const cross = new THREE.Group();
    for (const angle of [Math.PI / 4, -Math.PI / 4]) {
        const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.007), crossMaterial);
        bar.rotation.set(-Math.PI / 2, 0, angle);
        cross.add(bar);
    }
    cross.position.y = 0.001;
    // Invisible, slightly fatter shapes around the needle and head make the pin easy to hit.
    const hitMaterial = new THREE.MeshBasicMaterial({ visible: false });
    const needleHit = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.11, 6), hitMaterial);
    needleHit.position.y = 0.055;
    const headHit = new THREE.Mesh(new THREE.SphereGeometry(0.017 * headSize * 1.8, 10, 8), hitMaterial);
    headHit.position.y = head.position.y;
    marker.add(needle, head, cross, needleHit, headHit);
    pin.add(marker);

    const position = toVector(place.lat, place.lon);
    pin.position.copy(position);
    pin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), position.clone().normalize());
    pin.userData = { place, entries, head, marker, slot };
    // Every part of the pin (needle, head, the x and the hit shapes) answers hover and clicks.
    pin.traverse(part => { if (part.isMesh) part.userData.pin = pin; });
    return pin;
}

function groupByPlace(entries) {
    const places = new Map();
    for (const entry of entries) {
        const key = `${entry.lat.toFixed(1)},${entry.lon.toFixed(1)}`;
        if (!places.has(key)) places.set(key, { lat: entry.lat, lon: entry.lon, entries: [] });
        places.get(key).entries.push(entry);
    }
    for (const place of places.values()) place.entries.sort((a, b) => a.name.localeCompare(b.name));
    return [...places.values()];
}

export async function mountAtlas({ stage, tip, status, entries, imageFor, recipeUrl }) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.001, 100);
    camera.position.copy(toVector(35, 5, START_DISTANCE));

    scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const sun = new THREE.DirectionalLight(0xfff1e0, 2.2);
    sun.position.set(-3, 2, 4);
    camera.add(sun);
    scene.add(camera);

    const rings = await loadRings(LAND_URL);
    const globe = new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS, 128, 96),
        new THREE.MeshStandardMaterial({ map: globeTexture(rings), roughness: 0.9, metalness: 0 })
    );
    scene.add(globe);
    const coastline = new THREE.LineSegments(
        coastlineGeometry(rings),
        new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.8 })
    );
    globe.add(coastline);
    // Soft warm halo behind the globe.
    const halo = new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS * 1.06, 64, 48),
        new THREE.ShaderMaterial({
            transparent: true, side: THREE.BackSide, depthWrite: false,
            uniforms: { color: { value: new THREE.Color(ACCENT) } },
            vertexShader: 'varying vec3 vNormal; void main(){ vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
            fragmentShader: 'uniform vec3 color; varying vec3 vNormal; void main(){ float i = pow(0.75 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0); gl_FragColor = vec4(color, clamp(i, 0.0, 1.0) * 0.35); }'
        })
    );
    scene.add(halo);

    const pins = groupByPlace(entries).flatMap(place => {
        const count = place.entries.length;
        const recipePins = place.entries.map((entry, index) => makePin(place, [entry], count > 1 ? { index, count } : null));
        return count > 1 ? [makePin(place, place.entries), ...recipePins] : recipePins;
    });
    globe.add(...pins);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 1.03;
    controls.maxDistance = 6;
    controls.zoomSpeed = 0.8;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;

    stage.append(renderer.domElement);
    status.hidden = true;

    function resize() {
        const { clientWidth: width, clientHeight: height } = stage;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(stage);
    resize();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hovered = null;
    let downAt = null;
    let spinning = true;
    // Fetch and build the 1:10m coastline while the browser is idle, well before anyone zooms in.
    let detailGeometry = null;
    (window.requestIdleCallback || (callback => setTimeout(callback, 1500)))(() => {
        loadRings(LAND_DETAIL_URL)
            .then(detail => { detailGeometry = coastlineGeometry(detail); })
            .catch(error => console.warn('Detailed coastline unavailable:', error));
    });

    function pick(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
        raycaster.setFromCamera(pointer, camera);
        // Only accept a pin if nothing on the globe is in front of it.
        const parts = [globe];
        for (const pin of pins) if (pin.visible) pin.traverse(part => { if (part.isMesh) parts.push(part); });
        const hit = raycaster.intersectObjects(parts, false)[0];
        return hit && hit.object !== globe ? hit.object.userData.pin : null;
    }

    function fillTip(pin) {
        const { entries: shown } = pin.userData;
        const name = document.createElement('strong');
        const meta = document.createElement('span');
        const image = document.createElement('img');
        if (shown.length > 1) {
            name.textContent = `${shown.length} recipes from here`;
            meta.textContent = 'Click or zoom in to see them all';
            imageFor(image, shown[0]);
        } else {
            name.textContent = shown[0].name;
            meta.textContent = [shown[0].cuisine, shown[0].category].filter(Boolean).join(' · ');
            imageFor(image, shown[0]);
        }
        const text = document.createElement('div');
        text.append(name, meta);
        tip.replaceChildren(image, text);
    }

    function placeTip(event) {
        const rect = stage.getBoundingClientRect();
        const left = Math.min(event.clientX - rect.left + 18, rect.width - tip.offsetWidth - 8);
        tip.style.left = `${Math.max(left, 8)}px`;
        tip.style.top = `${Math.max(event.clientY - rect.top - tip.offsetHeight - 14, 8)}px`;
    }

    function setHovered(pin, event) {
        if (pin !== hovered) {
            if (hovered) hovered.userData.head.material.emissive.setHex(0x000000);
            hovered = pin;
            if (pin) {
                pin.userData.head.material.emissive.setHex(0x661010);
                fillTip(pin);
            }
            tip.hidden = !pin;
            renderer.domElement.style.cursor = pin ? 'pointer' : 'grab';
        }
        if (pin) placeTip(event);
    }

    // Clicking a place pin glides the camera down onto it so its recipes fan out.
    let flight = null;
    function flyTo(place) {
        const from = camera.position.clone();
        const to = toVector(place.lat, place.lon).multiplyScalar(EXPAND_DISTANCE * 0.85);
        // Keep the globe's own rotation in mind: pins live on the globe mesh.
        to.applyQuaternion(globe.quaternion);
        flight = { from, to, start: performance.now() };
        spinning = false;
    }

    renderer.domElement.addEventListener('pointermove', event => {
        if (downAt && Math.hypot(event.clientX - downAt[0], event.clientY - downAt[1]) > 5) {
            // The first hand-made rotation stops the idle spin for good (zooming doesn't count).
            spinning = false;
            flight = null;
        }
        if (event.buttons) return;
        setHovered(pick(event), event);
    });
    renderer.domElement.addEventListener('pointerleave', () => setHovered(null));
    renderer.domElement.addEventListener('pointerdown', event => { downAt = [event.clientX, event.clientY]; });
    renderer.domElement.addEventListener('pointerup', event => {
        const wasClick = downAt && Math.hypot(event.clientX - downAt[0], event.clientY - downAt[1]) <= 5;
        downAt = null;
        if (!wasClick) return;
        const pin = pick(event);
        if (!pin) return;
        const { entries: shown, place } = pin.userData;
        if (shown.length === 1) window.open(recipeUrl(shown[0]), '_blank', 'noopener');
        else flyTo(place);
    });
    renderer.domElement.addEventListener('wheel', () => { flight = null; }, { passive: true });

    let running = true;
    renderer.setAnimationLoop(() => {
        if (!running) return;
        controls.autoRotate = spinning && !hovered;
        if (flight) {
            const t = Math.min((performance.now() - flight.start) / 900, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            // Slerp the direction and ease the distance separately so the path hugs the globe.
            const direction = flight.from.clone().normalize().lerp(flight.to.clone().normalize(), eased).normalize();
            const distance = THREE.MathUtils.lerp(flight.from.length(), flight.to.length(), eased);
            camera.position.copy(direction.multiplyScalar(distance));
            if (t === 1) flight = null;
        }
        controls.update();
        // Keep pins the same size on screen: scale with the camera's height above the surface.
        const altitude = camera.position.length() - RADIUS;
        const scale = altitude / (START_DISTANCE - RADIUS);
        const expanded = camera.position.length() < EXPAND_DISTANCE;
        for (const pin of pins) {
            const { marker, slot, entries: shown } = pin.userData;
            pin.visible = shown.length > 1 ? !expanded : (!slot || expanded);
            marker.scale.setScalar(scale * (pin === hovered ? 1.4 : 1));
            if (slot) {
                // Fan recipe pins around their shared spot, spaced in screen terms.
                const angle = slot.index / slot.count * Math.PI * 2;
                const radius = FAN_RADIUS * (0.7 + slot.count * 0.08) * scale;
                marker.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
            }
        }
        if (hovered && !hovered.visible) setHovered(null);
        // Slow the drag down close to the surface so the globe doesn't fly past.
        controls.rotateSpeed = Math.min(0.5, 0.25 * altitude + 0.03);
        if (detailGeometry && camera.position.length() < DETAIL_DISTANCE) {
            // The detailed coastline was built ahead of time, so swapping it in is instant.
            coastline.geometry.dispose();
            coastline.geometry = detailGeometry;
            detailGeometry = null;
        }
        renderer.render(scene, camera);
    });

    return {
        pause() { running = false; setHovered(null); },
        resume() { running = true; resize(); }
    };
}
