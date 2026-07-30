(function() {
    'use strict';

    // ---------- DỮ LIỆU NHIỆT ĐỘ CHO 5 VÒNG ----------
    const tempData = [
        { label: 'Phòng khách', value: 24 },
        { label: 'Phòng ngủ 1', value: 22 },
        { label: 'Phòng ngủ 2', value: 23 },
        { label: 'Nhà bếp', value: 26 },
        { label: 'Ngoài trời', value: 20 }
    ];

    // ---------- DỮ LIỆU THIẾT BỊ THEO PHÒNG ----------
    const roomDevices = {
        'phong-ngu-1': [
            { name: 'Đèn ngủ', icon: 'fa-lightbulb', status: 'Đang tắt', on: false, type: 'light' },
            { name: 'Quạt', icon: 'fa-fan', status: 'Đang tắt', on: false, type: 'fan' }
        ],
        'phong-ngu-2': [
            { name: 'Đèn học', icon: 'fa-lamp', status: 'Đang tắt', on: false, type: 'light' },
            { name: 'Ổ cắm', icon: 'fa-plug', status: 'Đang tắt', on: false, type: 'plug' }
        ],
        'phong-trung-tam': [
            { name: 'Đèn trần', icon: 'fa-lightbulb', status: 'Đang tắt', on: false, type: 'light' },
            { name: 'Máy lạnh', icon: 'fa-snowflake', status: 'Đang tắt', on: false, type: 'ac' },
            { name: 'TV', icon: 'fa-tv', status: 'Đang tắt', on: false, type: 'tv' }
        ],
        'phong-khach': [
            { name: 'Đèn chùm', icon: 'fa-lightbulb', status: 'Đang tắt', on: false, type: 'light' },
            { name: 'Quạt trần', icon: 'fa-fan', status: 'Đang tắt', on: false, type: 'fan' },
            { name: 'Rèm cửa', icon: 'fa-wind', status: 'Đang tắt', on: false, type: 'curtain' }
        ]
    };

    // ---------- DOM REFS ----------
    const circleGrid = document.getElementById('circleGrid');
    const roomGrid = document.getElementById('roomGrid');
    const deviceGrid = document.getElementById('deviceGrid');
    const roomTitle = document.getElementById('roomTitle');
    const appContainer = document.getElementById('appContainer');
    const bgInput = document.getElementById('bgInput');
    const changeBgBtn = document.getElementById('changeBgBtn');
    const bottomDock = document.getElementById('bottomDock');
    const dockItems = bottomDock.querySelectorAll('.dock-item');
    const dockIndicator = document.getElementById('dockIndicator');
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceWave = document.getElementById('voiceWave');

    // ---------- SETTINGS DOM ----------
    const settingsOverlay = document.getElementById('settingsOverlay');
    const settingsClose = document.getElementById('settingsClose');
    const customColorPicker = document.getElementById('customColorPicker');
    const customColorHex = document.getElementById('customColorHex');
    const colorPresets = document.querySelectorAll('.color-preset');
    const glassOpacitySlider = document.getElementById('glassOpacitySlider');
    const glassOpacityValue = document.getElementById('glassOpacityValue');
    const bgBlurSlider = document.getElementById('bgBlurSlider');
    const bgBlurValue = document.getElementById('bgBlurValue');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const modeLabel = document.getElementById('modeLabel');
    const soundToggle = document.getElementById('soundToggle');
    const voiceFeedbackToggle = document.getElementById('voiceFeedbackToggle');
    const resetBtn = document.getElementById('resetBtn');
    const mqttHost = document.getElementById('mqttHost');
    const mqttPort = document.getElementById('mqttPort');
    const mqttUser = document.getElementById('mqttUser');
    const mqttPass = document.getElementById('mqttPass');
    const mqttSaveBtn = document.getElementById('mqttSaveBtn');
    const connLed = document.getElementById('connLed');
    const connStatusText = document.getElementById('connStatusText');
    const connPing = document.getElementById('connPing');
    const refreshRate = document.getElementById('refreshRate');

    // ---------- STATE ----------
    let currentAccentColor = '#2c6bff';
    let isSoundEnabled = true;
    let isVoiceFeedbackEnabled = true;
    let currentRoom = 'phong-ngu-1';

    // ---------- LƯU / TẢI LOCALSTORAGE ----------
    function saveSettings() {
        const settings = {
            accentColor: currentAccentColor,
            glassOpacity: glassOpacitySlider.value,
            bgBlur: bgBlurSlider.value,
            darkMode: darkModeToggle.checked,
            sound: soundToggle.checked,
            voiceFeedback: voiceFeedbackToggle.checked,
            mqttHost: mqttHost.value,
            mqttPort: mqttPort.value,
            mqttUser: mqttUser.value,
            mqttPass: mqttPass.value,
            refreshRate: refreshRate.value
        };
        localStorage.setItem('homekit_settings', JSON.stringify(settings));
    }

    function loadSettings() {
        const data = localStorage.getItem('homekit_settings');
        if (data) {
            try {
                const settings = JSON.parse(data);
                currentAccentColor = settings.accentColor || '#2c6bff';
                glassOpacitySlider.value = settings.glassOpacity || '0.25';
                bgBlurSlider.value = settings.bgBlur || '8';
                darkModeToggle.checked = settings.darkMode !== undefined ? settings.darkMode : true;
                soundToggle.checked = settings.sound !== undefined ? settings.sound : true;
                voiceFeedbackToggle.checked = settings.voiceFeedback !== undefined ? settings.voiceFeedback : true;
                mqttHost.value = settings.mqttHost || 'broker.hivemq.com';
                mqttPort.value = settings.mqttPort || '1883';
                mqttUser.value = settings.mqttUser || '';
                mqttPass.value = settings.mqttPass || '';
                refreshRate.value = settings.refreshRate || '5000';
                // Áp dụng
                applyAccentColor(currentAccentColor);
                applyGlassOpacity(glassOpacitySlider.value);
                applyBgBlur(bgBlurSlider.value);
                applyDarkMode(darkModeToggle.checked);
                isSoundEnabled = soundToggle.checked;
                isVoiceFeedbackEnabled = voiceFeedbackToggle.checked;
                // Cập nhật hiển thị
                glassOpacityValue.textContent = glassOpacitySlider.value;
                bgBlurValue.textContent = bgBlurSlider.value;
                customColorPicker.value = currentAccentColor;
                customColorHex.value = currentAccentColor;
                updateModeLabel(darkModeToggle.checked);
                // Cập nhật LED trạng thái (giả lập)
                updateConnectionStatus('connected', 12);
            } catch(e) { /* ignore */ }
        }
    }

    // ---------- ÁP DỤNG CÁC CÀI ĐẶT ----------
    function applyAccentColor(color) {
        currentAccentColor = color;
        // Thay đổi màu cho các toggle active, border active, glow
        document.documentElement.style.setProperty('--accent-color', color);
        // Cập nhật các toggle đang active
        document.querySelectorAll('.toggle.active').forEach(t => {
            t.style.background = `rgba(${hexToRgb(color)}, 0.8)`;
            t.style.boxShadow = `0 0 20px ${color}44`;
        });
        // Cập nhật màu cho các progress circle (sẽ được cập nhật trong animation)
        // Cập nhật màu cho dock indicator
        dockIndicator.style.background = color;
        // Cập nhật màu cho các nút phòng active
        document.querySelectorAll('.room-btn.active').forEach(btn => {
            btn.style.background = `${color}33`;
            btn.style.borderColor = `${color}88`;
            btn.style.boxShadow = `0 0 20px ${color}22`;
        });
        // Cập nhật màu cho các icon trong header
        document.querySelectorAll('.header-actions i').forEach(i => {
            i.style.color = color;
        });
        // Cập nhật màu cho các toggle switch
        document.querySelectorAll('.toggle-switch input:checked + .toggle-label').forEach(el => {
            el.style.background = color;
        });
        // Cập nhật màu cho các nút settings
        document.querySelectorAll('.settings-btn').forEach(btn => {
            btn.style.borderColor = color;
            btn.style.color = color;
        });
        // Lưu lại
        saveSettings();
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1],16)}, ${parseInt(result[2],16)}, ${parseInt(result[3],16)}` : '44, 107, 255';
    }

    function applyGlassOpacity(value) {
        const opacity = parseFloat(value);
        appContainer.style.background = `rgba(255, 255, 255, ${opacity})`;
        // Cập nhật các card
        document.querySelectorAll('.device-card, .circle-item, .room-btn, .settings-panel, .settings-group').forEach(el => {
            el.style.background = `rgba(255, 255, 255, ${opacity * 0.8})`;
        });
        glassOpacityValue.textContent = opacity.toFixed(2);
        saveSettings();
    }

    function applyBgBlur(value) {
        const blur = parseInt(value);
        document.body.style.backdropFilter = `blur(${blur}px)`;
        bgBlurValue.textContent = blur;
        saveSettings();
    }

    function applyDarkMode(isDark) {
        if (isDark) {
            // Chế độ tối: nền tối hơn, text sáng
            document.body.style.background = 'radial-gradient(circle at 20% 30%, #1a1a2e, #16213e, #0f0f1f)';
            document.querySelectorAll('.section-title, .header h1, .device-name, .device-status, .circle-label, .circle-temp, .footer-note, .setting-content label, .group-title, .settings-header h2, .settings-close, .mode-label, .connection-status, .range-value, select, .mqtt-fields input, #customColorHex').forEach(el => {
                el.style.color = '#e0e0e0';
            });
            appContainer.style.borderColor = 'rgba(255,255,255,0.1)';
            appContainer.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)';
            // Các card nền tối hơn
            document.querySelectorAll('.device-card, .circle-item, .room-btn, .settings-panel, .settings-group, .bottom-dock').forEach(el => {
                el.style.background = 'rgba(30, 30, 50, 0.4)';
                el.style.borderColor = 'rgba(255,255,255,0.1)';
            });
            // Các input
            document.querySelectorAll('input, select').forEach(el => {
                el.style.background = 'rgba(255,255,255,0.05)';
                el.style.color = '#e0e0e0';
                el.style.borderColor = 'rgba(255,255,255,0.1)';
            });
        } else {
            // Chế độ sáng
            document.body.style.background = 'radial-gradient(circle at 20% 30%, #d4e6ff, #b8cff0, #a3b8e0)';
            document.querySelectorAll('.section-title, .header h1, .device-name, .device-status, .circle-label, .circle-temp, .footer-note, .setting-content label, .group-title, .settings-header h2, .settings-close, .mode-label, .connection-status, .range-value, select, .mqtt-fields input, #customColorHex').forEach(el => {
                el.style.color = '#1c2a4a';
            });
            appContainer.style.borderColor = 'rgba(255,255,255,0.5)';
            appContainer.style.boxShadow = '0 20px 60px rgba(0,0,0,0.08)';
            document.querySelectorAll('.device-card, .circle-item, .room-btn, .settings-panel, .settings-group, .bottom-dock').forEach(el => {
                el.style.background = 'rgba(255, 255, 255, 0.25)';
                el.style.borderColor = 'rgba(255,255,255,0.4)';
            });
            document.querySelectorAll('input, select').forEach(el => {
                el.style.background = 'rgba(255,255,255,0.2)';
                el.style.color = '#1c2a4a';
                el.style.borderColor = 'rgba(255,255,255,0.3)';
            });
        }
        // Đảm bảo các toggle vẫn giữ màu accent
        document.querySelectorAll('.toggle.active').forEach(t => {
            t.style.background = `rgba(${hexToRgb(currentAccentColor)}, 0.8)`;
        });
        updateModeLabel(isDark);
        saveSettings();
    }

    function updateModeLabel(isDark) {
        modeLabel.textContent = isDark ? 'Tối' : 'Sáng';
    }

    function updateConnectionStatus(status, ping) {
        if (status === 'connected') {
            connLed.className = 'led led-green';
            connStatusText.textContent = 'Đã kết nối';
        } else if (status === 'disconnected') {
            connLed.className = 'led led-red';
            connStatusText.textContent = 'Mất kết nối';
        } else {
            connLed.className = 'led led-yellow';
            connStatusText.textContent = 'Đang thử lại...';
        }
        if (ping !== undefined) {
            connPing.textContent = `Ping: ${ping} ms`;
        }
    }

    // ---------- TẠO VÒNG TRÒN NHIỆT ĐỘ ----------
    function createCircle(item, index) {
        const container = document.createElement('div');
        container.className = 'circle-item';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 120 120');
        svg.classList.add('circle-svg');

        const circleBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circleBg.setAttribute('cx', '60');
        circleBg.setAttribute('cy', '60');
        circleBg.setAttribute('r', '48');
        circleBg.classList.add('circle-bg');

        const circleProgress = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circleProgress.setAttribute('cx', '60');
        circleProgress.setAttribute('cy', '60');
        circleProgress.setAttribute('r', '48');
        circleProgress.classList.add('circle-progress');
        const circumference = 2 * Math.PI * 48;
        circleProgress.style.strokeDasharray = circumference;
        circleProgress.style.strokeDashoffset = circumference;

        svg.appendChild(circleBg);
        svg.appendChild(circleProgress);

        const label = document.createElement('div');
        label.className = 'circle-label';
        label.textContent = item.label;

        const tempDisplay = document.createElement('div');
        tempDisplay.className = 'circle-temp';
        tempDisplay.innerHTML = `0<span class="unit">°C</span>`;

        container.appendChild(svg);
        container.appendChild(label);
        container.appendChild(tempDisplay);

        container._progress = circleProgress;
        container._tempDisplay = tempDisplay;
        container._targetValue = item.value;
        container._circumference = circumference;
        container._currentValue = 0;

        return container;
    }

    function renderCircles() {
        tempData.forEach((item, idx) => {
            const el = createCircle(item, idx);
            circleGrid.appendChild(el);
        });
    }

    // ---------- ANIMATION VÒNG TRÒN (có màu theo nhiệt độ) ----------
    function animateCircles() {
        const items = circleGrid.querySelectorAll('.circle-item');
        items.forEach((el, idx) => {
            const target = tempData[idx].value;
            const progress = el._progress;
            const tempDisplay = el._tempDisplay;
            const circumference = el._circumference;

            let current = 0;
            const step = Math.max(1, target / 60);
            const interval = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(interval);
                }
                const offset = circumference - (current / 100) * circumference;
                progress.style.strokeDashoffset = offset;
                tempDisplay.innerHTML = `${Math.round(current)}<span class="unit">°C</span>`;
                // Cập nhật màu sắc theo nhiệt độ với hiệu ứng tỏa sáng
                updateCircleColor(progress, current);
                el._currentValue = current;
            }, 20);
        });
    }

    // ---------- CẬP NHẬT MÀU VÒNG TRÒN THEO NHIỆT ĐỘ (có tỏa sáng) ----------
    function updateCircleColor(progressEl, temp) {
        let color;
        let glowIntensity = 6;
        if (temp < 30) {
            color = '#2ecc71'; // xanh
            glowIntensity = 12;
        } else if (temp >= 30 && temp <= 36) {
            color = '#f1c40f'; // vàng
            glowIntensity = 14;
        } else {
            color = '#e74c3c'; // đỏ
            glowIntensity = 18;
        }
        progressEl.style.stroke = color;
        progressEl.style.filter = `drop-shadow(0 0 ${glowIntensity}px ${color}88)`;
    }

    // ---------- RENDER THIẾT BỊ THEO PHÒNG ----------
    function renderDevices(roomKey) {
        const devices = roomDevices[roomKey];
        if (!devices) {
            deviceGrid.innerHTML = '<p style="color:#4a5a7a;padding:20px;">Không có thiết bị trong phòng này.</p>';
            return;
        }

        let html = '';
        devices.forEach((dev, index) => {
            const statusText = dev.on ? 'Đang bật' : 'Đang tắt';
            const toggleClass = dev.on ? 'active' : '';
            const glowClass = dev.on ? 'glow' : '';
            html += `
                <div class="device-card ${glowClass}" data-device-index="${index}" data-room="${roomKey}">
                    <div class="device-icon"><i class="fas ${dev.icon}"></i></div>
                    <div class="device-name">${dev.name}</div>
                    <div class="device-status">${statusText}</div>
                    <div class="toggle-wrapper">
                        <button class="toggle ${toggleClass}" data-index="${index}" data-room="${roomKey}"></button>
                    </div>
                </div>
            `;
        });
        deviceGrid.innerHTML = html;

        // Gán sự kiện cho toggle
        deviceGrid.querySelectorAll('.toggle').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const room = this.dataset.room;
                const idx = parseInt(this.dataset.index);
                toggleDevice(room, idx);
                if (isSoundEnabled) playClickSound();
            });
            btn.addEventListener('click', function(e) {
                createRipple(e, this);
            });
        });

        // Parallax 3D
        deviceGrid.querySelectorAll('.device-card').forEach(card => {
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                this.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            });
        });

        deviceGrid.querySelectorAll('.device-card').forEach(card => {
            card.addEventListener('click', function(e) {
                if (e.target.closest('.toggle')) return;
                createRipple(e, this);
                if (isSoundEnabled) playClickSound();
            });
        });
    }

    // ---------- TOGGLE THIẾT BỊ ----------
    function toggleDevice(roomKey, index) {
        const devices = roomDevices[roomKey];
        if (!devices || !devices[index]) return;
        const dev = devices[index];
        dev.on = !dev.on;
        renderDevices(roomKey);
        const roomName = getRoomDisplayName(roomKey);
        roomTitle.textContent = roomName;
        highlightRoom(roomKey);
        // Nếu phản hồi giọng nói bật
        if (isVoiceFeedbackEnabled) {
            const statusText = dev.on ? 'bật' : 'tắt';
            speakResponse(`${dev.name} đã ${statusText}`);
        }
    }

    // ---------- LẤY TÊN PHÒNG HIỂN THỊ ----------
    function getRoomDisplayName(roomKey) {
        const map = {
            'phong-ngu-1': 'Phòng ngủ 1',
            'phong-ngu-2': 'Phòng ngủ 2',
            'phong-trung-tam': 'Phòng trung tâm',
            'phong-khach': 'Phòng khách'
        };
        return map[roomKey] || roomKey;
    }

    // ---------- ĐÁNH DẤU BUTTON PHÒNG ----------
    function highlightRoom(roomKey) {
        roomGrid.querySelectorAll('.room-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.room === roomKey);
            if (btn.classList.contains('active')) {
                btn.style.background = `${currentAccentColor}33`;
                btn.style.borderColor = `${currentAccentColor}88`;
                btn.style.boxShadow = `0 0 20px ${currentAccentColor}22`;
            } else {
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.style.boxShadow = '';
            }
        });
    }

    // ---------- HIỆU ỨNG GIỌT NƯỚC (RIPPLE) ----------
    function createRipple(event, element) {
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = (event.clientX || event.touches?.[0]?.clientX || rect.left + rect.width/2) - rect.left - size/2;
        const y = (event.clientY || event.touches?.[0]?.clientY || rect.top + rect.height/2) - rect.top - size/2;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = `rgba(255,255,255,0.5)`;
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'rippleAnim 0.6s ease-out forwards';
        ripple.style.pointerEvents = 'none';

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 700);
    }

    // ---------- XỬ LÝ SỰ KIỆN CHỌN PHÒNG ----------
    function handleRoomClick(roomKey) {
        const roomName = getRoomDisplayName(roomKey);
        roomTitle.textContent = roomName;
        renderDevices(roomKey);
        highlightRoom(roomKey);
        currentRoom = roomKey;
    }

    // ---------- BOTTOM DOCK ----------
    function setupDock() {
        function moveIndicator(activeItem) {
            const rect = activeItem.getBoundingClientRect();
            const dockRect = bottomDock.getBoundingClientRect();
            const left = rect.left - dockRect.left + (rect.width/2) - 30;
            dockIndicator.style.left = left + 'px';
            dockIndicator.style.width = '60px';
        }

        const defaultActive = bottomDock.querySelector('.dock-item.active');
        if (defaultActive) {
            setTimeout(() => moveIndicator(defaultActive), 100);
        }

        dockItems.forEach(item => {
            item.addEventListener('click', function(e) {
                dockItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                moveIndicator(this);
                const tab = this.dataset.tab;
                handleTabSwitch(tab);
                createRipple(e, this);
                if (isSoundEnabled) playClickSound();
            });
        });

        voiceBtn.addEventListener('click', function(e) {
            toggleVoiceAssistant();
            createRipple(e, this);
            if (isSoundEnabled) playClickSound();
        });

        // Settings button
        const settingsTab = bottomDock.querySelector('[data-tab="settings"]');
        if (settingsTab) {
            settingsTab.addEventListener('click', function() {
                settingsOverlay.style.display = 'flex';
            });
        }
    }

    function handleTabSwitch(tab) {
        if (tab === 'home') {
            document.querySelector('.temperature-section').style.display = 'block';
            document.querySelector('.rooms-section').style.display = 'block';
            document.querySelector('.devices-section').style.display = 'block';
            document.querySelector('.footer-note').style.display = 'block';
        } else if (tab === 'scenes') {
            showScenes();
        } else if (tab === 'settings') {
            settingsOverlay.style.display = 'flex';
        }
    }

    // ---------- HIỂN THỊ KỊCH BẢN (SCENES) ----------
    function showScenes() {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0,0,0,0.3)';
        overlay.style.backdropFilter = 'blur(10px)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '200';
        overlay.innerHTML = `
            <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(20px); border-radius: 30px; padding: 30px; max-width: 500px; width: 90%; border: 1px solid rgba(255,255,255,0.3);">
                <h2 style="color: #1c2a4a; margin-bottom: 20px;">Kịch bản thông minh</h2>
                <button class="scene-btn" data-scene="movie" style="display:block; width:100%; padding:15px; margin:10px 0; background: rgba(255,255,255,0.3); border:1px solid rgba(255,255,255,0.5); border-radius: 16px; font-size:18px; cursor:pointer;">🎬 Xem phim</button>
                <button class="scene-btn" data-scene="sleep" style="display:block; width:100%; padding:15px; margin:10px 0; background: rgba(255,255,255,0.3); border:1px solid rgba(255,255,255,0.5); border-radius: 16px; font-size:18px; cursor:pointer;">🌙 Đi ngủ</button>
                <button class="scene-btn" data-scene="leave" style="display:block; width:100%; padding:15px; margin:10px 0; background: rgba(255,255,255,0.3); border:1px solid rgba(255,255,255,0.5); border-radius: 16px; font-size:18px; cursor:pointer;">🚪 Ra khỏi nhà</button>
                <button style="margin-top:20px; padding:12px 30px; background: rgba(255,0,0,0.2); border:1px solid rgba(255,0,0,0.3); border-radius: 30px; color: #1c2a4a; cursor:pointer;" onclick="this.parentElement.parentElement.remove()">Đóng</button>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelectorAll('.scene-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const scene = this.dataset.scene;
                executeScene(scene);
                setTimeout(() => overlay.remove(), 500);
            });
        });

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });
    }

    // ---------- THỰC HIỆN KỊCH BẢN ----------
    function executeScene(scene) {
        const allDevices = roomDevices;
        let message = '';
        switch(scene) {
            case 'movie':
                if (allDevices['phong-khach']) {
                    const denChum = allDevices['phong-khach'].find(d => d.name === 'Đèn chùm');
                    if (denChum) denChum.on = false;
                }
                if (allDevices['phong-ngu-1']) {
                    const denNgu = allDevices['phong-ngu-1'].find(d => d.name === 'Đèn ngủ');
                    if (denNgu) denNgu.on = true;
                }
                if (allDevices['phong-khach']) {
                    const rem = allDevices['phong-khach'].find(d => d.name === 'Rèm cửa');
                    if (rem) rem.on = true;
                }
                message = 'Đã kích hoạt kịch bản Xem phim';
                break;
            case 'sleep':
                if (allDevices['phong-khach']) {
                    allDevices['phong-khach'].forEach(d => { if (d.type === 'light') d.on = false; });
                }
                if (allDevices['phong-trung-tam']) {
                    const mayLanh = allDevices['phong-trung-tam'].find(d => d.name === 'Máy lạnh');
                    if (mayLanh) mayLanh.on = true;
                }
                if (allDevices['phong-ngu-1']) {
                    const denNgu = allDevices['phong-ngu-1'].find(d => d.name === 'Đèn ngủ');
                    if (denNgu) denNgu.on = true;
                }
                message = 'Đã kích hoạt kịch bản Đi ngủ';
                break;
            case 'leave':
                for (let room in allDevices) {
                    allDevices[room].forEach(d => d.on = false);
                }
                message = 'Đã tắt tất cả thiết bị (Ra khỏi nhà)';
                break;
            default:
                return;
        }
        const activeRoom = document.querySelector('.room-btn.active');
        if (activeRoom) {
            const roomKey = activeRoom.dataset.room;
            renderDevices(roomKey);
        }
        if (isVoiceFeedbackEnabled) speakResponse(message);
        else alert(message);
    }

    // ---------- TRỢ LÝ GIỌNG NÓI ----------
    let recognition = null;
    let isListening = false;

    function toggleVoiceAssistant() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Trình duyệt không hỗ trợ nhận dạng giọng nói.');
            return;
        }
        if (isListening) {
            if (recognition) {
                recognition.stop();
            }
            isListening = false;
            voiceWave.classList.remove('active');
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.interimResults = false;
        recognition.continuous = false;

        recognition.onstart = function() {
            isListening = true;
            voiceWave.classList.add('active');
        };
        recognition.onerror = function(event) {
            isListening = false;
            voiceWave.classList.remove('active');
        };
        recognition.onend = function() {
            isListening = false;
            voiceWave.classList.remove('active');
        };
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript.toLowerCase();
            processVoiceCommand(transcript);
            recognition.stop();
        };
        recognition.start();
    }

    function processVoiceCommand(text) {
        let found = false;
        for (let room in roomDevices) {
            roomDevices[room].forEach((dev, idx) => {
                const devName = dev.name.toLowerCase();
                if (text.includes(devName)) {
                    if (text.includes('bật')) {
                        if (!dev.on) {
                            toggleDevice(room, idx);
                            found = true;
                        }
                    } else if (text.includes('tắt')) {
                        if (dev.on) {
                            toggleDevice(room, idx);
                            found = true;
                        }
                    }
                }
            });
        }
        if (!found && isVoiceFeedbackEnabled) {
            speakResponse('Không tìm thấy thiết bị nào phù hợp.');
        }
    }

    function speakResponse(text) {
        if (!isVoiceFeedbackEnabled) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
    }

    // ---------- ÂM THANH PHẢN HỒI ----------
    function playClickSound() {
        if (!isSoundEnabled) return;
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.1;
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
            oscillator.stop(audioCtx.currentTime + 0.05);
        } catch (e) { /* fallback */ }
    }

    // ---------- ĐỔI HÌNH NỀN ----------
    function setupBackground() {
        const savedBg = localStorage.getItem('homekit_bg');
        if (savedBg) {
            document.body.style.backgroundImage = `url(${savedBg})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            appContainer.classList.add('bg-dim');
        }

        changeBgBtn.addEventListener('click', function() {
            bgInput.click();
        });

        bgInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                const dataUrl = ev.target.result;
                document.body.style.backgroundImage = `url(${dataUrl})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                appContainer.classList.add('bg-dim');
                localStorage.setItem('homekit_bg', dataUrl);
            };
            reader.readAsDataURL(file);
            this.value = '';
        });
    }

    // ---------- CÀI ĐẶT SETTINGS ----------
    function setupSettings() {
        // Đóng settings
        settingsClose.addEventListener('click', function() {
            settingsOverlay.style.display = 'none';
        });
        settingsOverlay.addEventListener('click', function(e) {
            if (e.target === settingsOverlay) settingsOverlay.style.display = 'none';
        });

        // Màu sắc
        colorPresets.forEach(btn => {
            btn.addEventListener('click', function() {
                const color = this.dataset.color;
                customColorPicker.value = color;
                customColorHex.value = color;
                applyAccentColor(color);
            });
        });
        customColorPicker.addEventListener('input', function() {
            const color = this.value;
            customColorHex.value = color;
            applyAccentColor(color);
        });
        customColorHex.addEventListener('input', function() {
            let color = this.value.trim();
            if (color.startsWith('#')) {
                // Kiểm tra hợp lệ
                if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
                    customColorPicker.value = color;
                    applyAccentColor(color);
                }
            }
        });

        // Độ mờ kính
        glassOpacitySlider.addEventListener('input', function() {
            applyGlassOpacity(this.value);
        });

        // Blur nền
        bgBlurSlider.addEventListener('input', function() {
            applyBgBlur(this.value);
        });

        // Dark mode
        darkModeToggle.addEventListener('change', function() {
            applyDarkMode(this.checked);
        });

        // Âm thanh
        soundToggle.addEventListener('change', function() {
            isSoundEnabled = this.checked;
            saveSettings();
        });
        voiceFeedbackToggle.addEventListener('change', function() {
            isVoiceFeedbackEnabled = this.checked;
            saveSettings();
        });

        // Tần suất cập nhật
        refreshRate.addEventListener('change', function() {
            saveSettings();
            // Giả lập thay đổi tần suất
            console.log('Tần suất cập nhật:', this.value);
        });

        // MQTT
        mqttSaveBtn.addEventListener('click', function() {
            // Giả lập kết nối
            updateConnectionStatus('connecting');
            setTimeout(() => {
                updateConnectionStatus('connected', Math.floor(Math.random() * 30) + 5);
                saveSettings();
            }, 1000);
        });

        // Reset
        resetBtn.addEventListener('click', function() {
            if (confirm('Bạn có chắc muốn khôi phục cài đặt gốc?')) {
                localStorage.removeItem('homekit_settings');
                localStorage.removeItem('homekit_bg');
                location.reload();
            }
        });
    }

    // ---------- KHỞI TẠO ----------
    function init() {
        // 1. Render vòng tròn
        renderCircles();

        // 2. Chạy animation nhiệt độ
        setTimeout(animateCircles, 300);

        // 3. Gán sự kiện cho các button phòng
        roomGrid.querySelectorAll('.room-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const room = this.dataset.room;
                handleRoomClick(room);
                createRipple(e, this);
                if (isSoundEnabled) playClickSound();
            });
        });

        // 4. Mặc định chọn phòng đầu tiên
        const defaultRoom = 'phong-ngu-1';
        const defaultBtn = roomGrid.querySelector(`.room-btn[data-room="${defaultRoom}"]`);
        if (defaultBtn) {
            defaultBtn.classList.add('active');
            defaultBtn.style.background = `${currentAccentColor}33`;
            defaultBtn.style.borderColor = `${currentAccentColor}88`;
            defaultBtn.style.boxShadow = `0 0 20px ${currentAccentColor}22`;
            handleRoomClick(defaultRoom);
        } else {
            roomTitle.textContent = 'Chọn một phòng';
            deviceGrid.innerHTML = '<p style="color:#4a5a7a;padding:20px;">Vui lòng chọn phòng bên trên.</p>';
        }

        // 5. Setup dock
        setupDock();

        // 6. Setup background
        setupBackground();

        // 7. Thêm ripple cho header icon
        document.querySelectorAll('.header-actions i').forEach(el => {
            el.addEventListener('click', function(e) {
                createRipple(e, this.parentElement);
                if (isSoundEnabled) playClickSound();
            });
        });

        // 8. Parallax cho vòng tròn
        document.querySelectorAll('.circle-item').forEach(item => {
            item.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 30;
                const rotateY = (centerX - x) / 30;
                this.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            });
        });

        // 9. Setup Settings
        setupSettings();

        // 10. Load settings từ localStorage
        loadSettings();

        // 11. Giả lập cập nhật nhiệt độ theo chu kỳ (nếu có)
        // ...

        console.log('🏠 HomeKit Glass với đầy đủ tính năng đã sẵn sàng!');
    }

    // Chạy khi DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();