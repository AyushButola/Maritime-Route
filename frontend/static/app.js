/**
 * Maritime AI - Intelligent Weather Solutions with Optional Authentication
 * Professional maritime weather application with slide-based navigation
 * Authentication is completely optional - all features work without login
 */

class MaritimeAI {
    constructor() {
        this.state = {
            currentSlide: 0,
            totalSlides: 4,
            charts: {},
            touchStartX: 0,
            touchEndX: 0,
            isTransitioning: false,
            user: {
                isAuthenticated: false,
                uid: null,
                email: null,
                username: null,
                displayName: null
            },
            location: {
                latitude: null,
                longitude: null,
                accuracy: null,
                timestamp: null,
                status: 'detecting', // 'detecting', 'active', 'error', 'manual'
                source: 'gps', // 'gps', 'manual'
                watchId: null,
                isManualMode: false,
                locationName: 'North Atlantic Ocean'
            }
        };

        this.config = {
            transitionDuration: 800,
            touchThreshold: 50,
            chartColors: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'],
            maritimeColors: {
                primary: '#00A8E8',
                secondary: '#4FC3F7', 
                success: '#26A69A',
                warning: '#FFA726',
                danger: '#FF5252',
                text: '#FFFFFF',
                textSecondary: '#B0BEC5'
            },
            geolocation: {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            },
            fallbackMessage: 'Location unavailable — please enable GPS or enter manually.',
            coordinateValidation: {
                latitude: { min: -90, max: 90 },
                longitude: { min: -180, max: 180 }
            }
        };

        // Enhanced maritime data
        this.data = {
            weatherConfidence: {
                overall: 96,
                dataSources: {
                    satellite: 98,
                    modelAccuracy: 95,
                    historicalPatterns: 94,
                    sensorData: 97
                }
            },
            currentConditions: {
                temperature: { value: 22, feelsLike: 25 },
                wind: { speed: 18, direction: "NE", gusts: 24 },
                waves: { height: 2.3, period: "7-9s" },
                visibility: { value: 10, unit: "nm" },
                pressure: { value: 1015.2, trend: "stable" },
                humidity: { value: 68, dewPoint: 16 }
            },
            vesselOptimization: {
                currentSpeed: 13.5,
                recommendedSpeed: 14.2,
                currentConsumption: 85,
                optimizedConsumption: 72,
                savings: 15.3,
                efficiency: 94,
                dailyCostSavings: 468
            },
            chartData: {
                forecast: {
                    temperature: [22, 19, 17, 16, 18, 20, 22, 23, 24, 22],
                    windSpeed: [18, 22, 28, 35, 26, 20, 16, 14, 12, 18],
                    waveHeight: [2.3, 2.8, 3.5, 4.8, 3.2, 2.6, 2.1, 1.8, 1.6, 2.2]
                },
                todayHourly: {
                    labels: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
                    temperature: [22, 21, 20, 20, 21, 22, 23, 24, 25, 25, 24, 23, 22, 21, 20, 19, 19, 20, 21, 22, 23, 22, 21, 20],
                    windSpeed: [18, 17, 16, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 24, 23, 22, 21, 20, 19, 18, 17, 16, 17, 18],
                    waveHeight: [2.3, 2.2, 2.1, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.8, 2.7, 2.6, 2.5, 2.4, 2.3, 2.2, 2.1, 2.0, 2.1, 2.2],
                    pressure: [1015.2, 1015.1, 1015.0, 1014.9, 1015.0, 1015.1, 1015.2, 1015.3, 1015.4, 1015.5, 1015.6, 1015.7, 1015.8, 1015.7, 1015.6, 1015.5, 1015.4, 1015.3, 1015.2, 1015.1, 1015.0, 1014.9, 1015.0, 1015.1]
                },
                detection: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                    stormDetection: [85, 87, 89, 88, 86, 87, 88, 87],
                    swellDetection: [92, 93, 94, 95, 94, 95, 96, 95],
                    fogDetection: [88, 90, 91, 92, 90, 91, 92, 91],
                    currentAlert: [86, 87, 88, 89, 88, 89, 90, 89]
                }
            },
            locationRegions: [
                {name: "North Atlantic Ocean", bounds: {latMin: 40, latMax: 70, lngMin: -80, lngMax: 0}},
                {name: "Mediterranean Sea", bounds: {latMin: 30, latMax: 46, lngMin: -6, lngMax: 36}},
                {name: "Caribbean Sea", bounds: {latMin: 9, latMax: 25, lngMin: -90, lngMax: -60}},
                {name: "Arabian Sea", bounds: {latMin: 0, latMax: 30, lngMin: 50, lngMax: 80}},
                {name: "South China Sea", bounds: {latMin: 0, latMax: 25, lngMin: 99, lngMax: 125}},
                {name: "North Sea", bounds: {latMin: 51, latMax: 62, lngMin: -4, lngMax: 9}}
            ]
        };

        this.refs = {};
        this.init();
    }

    init() {
        console.log('🌊 Initializing Maritime AI Weather System...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupApplication();
            });
        } else {
            this.setupApplication();
        }
    }

    setupApplication() {
        try {
            console.log('🔧 Setting up application components...');
            this.initDOMReferences();
            this.initEventListeners();
            this.initCharts();
            this.initTouchEvents();
            this.populateData();
            this.initGeolocation();
            this.animateEntrance();
            
            // Ensure default slide is properly set
            this.goToSlide(0);
            
            // Show emergency notification after 8 seconds (demo)
            setTimeout(() => {
                this.showEmergencyNotification();
            }, 8000);

            console.log('✅ Maritime AI initialized successfully - No authentication required');
            console.log('🎯 All features are available without login');
        } catch (error) {
            console.error('❌ Error during setup:', error);
        }
    }

    initDOMReferences() {
        console.log('📋 Initializing DOM references...');
        
        this.refs = {
            // Main elements
            slidesWrapper: document.getElementById('slidesWrapper'),
            navItems: document.querySelectorAll('.nav-item'),
            
            // Authentication elements
            authModal: document.getElementById('authModal'),
            closeAuthModal: document.getElementById('closeAuthModal'),
            authButtons: document.getElementById('authButtons'),
            userProfile: document.getElementById('userProfile'),
            loginBtn: document.getElementById('loginBtn'),
            signupBtn: document.getElementById('signupBtn'),
            logoutBtn: document.getElementById('logoutBtn'),
            userName: document.getElementById('userName'),
            userEmail: document.getElementById('userEmail'),
            
            // Auth form elements
            authTabs: document.querySelectorAll('.auth-tab-btn'),
            loginTab: document.getElementById('loginTab'),
            signupTab: document.getElementById('signupTab'),
            loginForm: document.getElementById('loginForm'),
            signupForm: document.getElementById('signupForm'),
            authMessage: document.getElementById('authMessage'),
            authLoading: document.getElementById('authLoading'),
            
            // Location elements
            locationItem: document.getElementById('locationItem'),
            locationValue: document.getElementById('locationValue'),
            locationDetail: document.getElementById('locationDetail'),
            navCoordinates: document.getElementById('navCoordinates'),
            locationName: document.getElementById('locationName'),
            
            // Manual location controls
            toggleManualBtn: document.getElementById('toggleManualBtn'),
            manualInputs: document.getElementById('manualInputs'),
            latitudeInput: document.getElementById('latitudeInput'),
            longitudeInput: document.getElementById('longitudeInput'),
            updateLocationBtn: document.getElementById('updateLocationBtn'),
            resetGpsBtn: document.getElementById('resetGpsBtn'),
            inputValidation: document.getElementById('inputValidation'),
            
            // Charts
            forecastChart: document.getElementById('forecastChart'),
            todayChart: document.getElementById('todayChart'),
            detectionChart: document.getElementById('detectionChart'),
            
            // Emergency modal
            emergencyModal: document.getElementById('emergencyModal'),
            closeModal: document.getElementById('closeModal'),
            acknowledgeBtn: document.getElementById('acknowledgeBtn'),
            routeOptionsBtn: document.getElementById('routeOptionsBtn'),
            
            // Period buttons
            periodBtns: document.querySelectorAll('.period-btn')
        };

        // Log found elements
        const foundElements = Object.keys(this.refs).filter(key => this.refs[key]).length;
        const totalElements = Object.keys(this.refs).length;
        console.log(`📋 DOM References: ${foundElements}/${totalElements} elements found`);
        
        // Check for critical missing elements
        if (!this.refs.slidesWrapper) console.error('❌ Critical: slidesWrapper not found');
        if (!this.refs.navItems || this.refs.navItems.length === 0) console.error('❌ Critical: navItems not found');
        if (!this.refs.loginBtn) console.warn('⚠️ loginBtn not found');
        if (!this.refs.signupBtn) console.warn('⚠️ signupBtn not found');
    }

    initEventListeners() {
        console.log('🎧 Setting up event listeners...');

        // Navigation items - FIXED: Ensure proper slide navigation
        if (this.refs.navItems && this.refs.navItems.length > 0) {
            this.refs.navItems.forEach((item, index) => {
                const slideIndex = parseInt(item.getAttribute('data-slide'));
                console.log(`🧭 Setting up nav item ${index} for slide ${slideIndex}`);
                
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`🎯 Navigation clicked: slide ${slideIndex}`);
                    
                    if (!isNaN(slideIndex) && slideIndex >= 0 && slideIndex < this.state.totalSlides) {
                        this.goToSlide(slideIndex);
                    } else {
                        console.error(`❌ Invalid slide index: ${slideIndex}`);
                    }
                });
            });
        } else {
            console.error('❌ No navigation items found');
        }

        // Authentication event listeners - FIXED: Robust error handling
        if (this.refs.loginBtn) {
            this.refs.loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔐 Login button clicked');
                this.showAuthModal('login');
            });
            console.log('✅ Login button listener attached');
        } else {
            console.warn('⚠️ Login button not found');
        }

        if (this.refs.signupBtn) {
            this.refs.signupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔐 Signup button clicked');
                this.showAuthModal('signup');
            });
            console.log('✅ Signup button listener attached');
        } else {
            console.warn('⚠️ Signup button not found');
        }

        if (this.refs.logoutBtn) {
            this.refs.logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.signOut();
            });
        }

        if (this.refs.closeAuthModal) {
            this.refs.closeAuthModal.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.hideAuthModal();
            });
        }

        // Auth tabs
        if (this.refs.authTabs && this.refs.authTabs.length > 0) {
            this.refs.authTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const tabType = e.target.getAttribute('data-tab');
                    this.switchAuthTab(tabType);
                });
            });
        }

        // Auth forms
        if (this.refs.loginForm) {
            this.refs.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        if (this.refs.signupForm) {
            this.refs.signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }

        // Manual location toggle
        if (this.refs.toggleManualBtn) {
            this.refs.toggleManualBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('📍 Toggle manual button clicked');
                this.toggleManualLocationInput();
            });
        }

        // Manual location inputs
        if (this.refs.latitudeInput) {
            this.refs.latitudeInput.addEventListener('input', () => this.validateCoordinateInputs());
            this.refs.latitudeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.updateManualLocation();
            });
        }

        if (this.refs.longitudeInput) {
            this.refs.longitudeInput.addEventListener('input', () => this.validateCoordinateInputs());
            this.refs.longitudeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.updateManualLocation();
            });
        }

        // Manual location actions
        if (this.refs.updateLocationBtn) {
            this.refs.updateLocationBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.updateManualLocation();
            });
        }

        if (this.refs.resetGpsBtn) {
            this.refs.resetGpsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.resetToGpsMode();
            });
        }

        // Period buttons
        if (this.refs.periodBtns && this.refs.periodBtns.length > 0) {
            this.refs.periodBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.updatePeriodButtons(e.currentTarget);
                });
            });
        }

        // Emergency modal
        if (this.refs.closeModal) {
            this.refs.closeModal.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.hideEmergencyModal();
            });
        }

        if (this.refs.acknowledgeBtn) {
            this.refs.acknowledgeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.hideEmergencyModal();
            });
        }

        if (this.refs.routeOptionsBtn) {
            this.refs.routeOptionsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.hideEmergencyModal();
                this.goToSlide(1); // Go to forecast slide
            });
        }

        // Modal overlays
        if (this.refs.emergencyModal) {
            this.refs.emergencyModal.addEventListener('click', (e) => {
                if (e.target === this.refs.emergencyModal || e.target.classList.contains('modal-overlay')) {
                    e.stopPropagation();
                    this.hideEmergencyModal();
                }
            });
        }

        if (this.refs.authModal) {
            this.refs.authModal.addEventListener('click', (e) => {
                if (e.target === this.refs.authModal || e.target.classList.contains('modal-overlay')) {
                    e.stopPropagation();
                    this.hideAuthModal();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));

        // Window resize
        window.addEventListener('resize', () => this.handleResize());

        console.log('✅ Event listeners setup complete');
    }

    // Authentication Methods
    showAuthModal(type = 'login') {
        console.log('🔐 Showing auth modal:', type);
        if (this.refs.authModal) {
            this.refs.authModal.classList.remove('hidden');
            this.switchAuthTab(type);
            console.log('✅ Auth modal displayed');
        } else {
            console.error('❌ Auth modal element not found');
        }
    }

    hideAuthModal() {
        console.log('🔐 Hiding auth modal');
        if (this.refs.authModal) {
            this.refs.authModal.classList.add('hidden');
        }
        this.clearAuthMessage();
    }

    switchAuthTab(tabType) {
        console.log('🔐 Switching to tab:', tabType);
        
        // Update tab buttons
        if (this.refs.authTabs && this.refs.authTabs.length > 0) {
            this.refs.authTabs.forEach(tab => {
                if (tab.getAttribute('data-tab') === tabType) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
        }

        // Update tab content
        const titleElement = document.getElementById('authModalTitle');
        if (tabType === 'login') {
            if (this.refs.loginTab) this.refs.loginTab.classList.add('active');
            if (this.refs.signupTab) this.refs.signupTab.classList.remove('active');
            if (titleElement) titleElement.textContent = 'Sign In';
        } else {
            if (this.refs.loginTab) this.refs.loginTab.classList.remove('active');
            if (this.refs.signupTab) this.refs.signupTab.classList.add('active');
            if (titleElement) titleElement.textContent = 'Sign Up';
        }

        this.clearAuthMessage();
    }

    async handleLogin() {
        console.log('🔐 Handling login...');
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        
        if (!emailInput || !passwordInput) {
            console.error('Login form elements not found');
            return;
        }
        
        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            this.showAuthMessage('Please fill in all fields', 'error');
            return;
        }

        this.showAuthLoading(true);

        try {
            // Demo authentication - simulate successful login
            const result = await this.demoSignIn(email, password);
            console.log('✅ Login successful');
            
            this.state.user = {
                isAuthenticated: true,
                uid: result.user.uid,
                email: result.user.email,
                username: result.user.displayName,
                displayName: result.user.displayName
            };
            
            this.updateAuthUI(true);
        } catch (error) {
            console.error('❌ Login failed:', error);
            this.showAuthMessage(error.message || 'Login failed', 'error');
        }

        this.showAuthLoading(false);
    }

    async handleSignup() {
        console.log('🔐 Handling signup...');
        const usernameInput = document.getElementById('signupUsername');
        const emailInput = document.getElementById('signupEmail');
        const passwordInput = document.getElementById('signupPassword');
        
        if (!usernameInput || !emailInput || !passwordInput) {
            console.error('Signup form elements not found');
            return;
        }
        
        const username = usernameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;

        if (!username || !email || !password) {
            this.showAuthMessage('Please fill in all fields', 'error');
            return;
        }

        if (password.length < 6) {
            this.showAuthMessage('Password must be at least 6 characters', 'error');
            return;
        }

        this.showAuthLoading(true);

        try {
            // Demo authentication - simulate successful signup
            const result = await this.demoSignUp(email, password, username);
            console.log('✅ Signup successful');
            
            this.state.user = {
                isAuthenticated: true,
                uid: result.user.uid,
                email: result.user.email,
                username: username,
                displayName: username
            };
            
            this.updateAuthUI(true);
        } catch (error) {
            console.error('❌ Signup failed:', error);
            this.showAuthMessage(error.message || 'Signup failed', 'error');
        }

        this.showAuthLoading(false);
    }

    async signOut() {
        console.log('🔐 Signing out...');
        try {
            this.state.user = {
                isAuthenticated: false,
                uid: null,
                email: null,
                username: null,
                displayName: null
            };
            
            this.updateAuthUI(false);
            console.log('✅ Signout successful');
        } catch (error) {
            console.error('❌ Signout failed:', error);
        }
    }

    // Demo authentication methods
    async demoSignIn(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email && password.length >= 6) {
                    const user = {
                        uid: 'demo-' + Date.now(),
                        email: email,
                        displayName: email.split('@')[0]
                    };
                    resolve({ user });
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 1000);
        });
    }

    async demoSignUp(email, password, username) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email && password.length >= 6 && username) {
                    const user = {
                        uid: 'demo-' + Date.now(),
                        email: email,
                        displayName: username
                    };
                    resolve({ user });
                } else {
                    reject(new Error('Invalid registration data'));
                }
            }, 1000);
        });
    }

    updateAuthUI(isAuthenticated) {
        if (isAuthenticated) {
            // Hide auth buttons, show user profile
            if (this.refs.authButtons) this.refs.authButtons.classList.add('hidden');
            if (this.refs.userProfile) this.refs.userProfile.classList.remove('hidden');
            
            // Update user info
            if (this.refs.userName) this.refs.userName.textContent = this.state.user.displayName;
            if (this.refs.userEmail) this.refs.userEmail.textContent = this.state.user.email;
            
            // Close auth modal
            this.hideAuthModal();
        } else {
            // Show auth buttons, hide user profile
            if (this.refs.authButtons) this.refs.authButtons.classList.remove('hidden');
            if (this.refs.userProfile) this.refs.userProfile.classList.add('hidden');
        }
    }

    showAuthMessage(message, type = 'info') {
        if (this.refs.authMessage) {
            this.refs.authMessage.textContent = message;
            this.refs.authMessage.className = `auth-message ${type}`;
            this.refs.authMessage.style.display = 'block';
        }
    }

    clearAuthMessage() {
        if (this.refs.authMessage) {
            this.refs.authMessage.style.display = 'none';
            this.refs.authMessage.textContent = '';
        }
    }

    showAuthLoading(show) {
        if (this.refs.authLoading) {
            if (show) {
                this.refs.authLoading.classList.remove('hidden');
            } else {
                this.refs.authLoading.classList.add('hidden');
            }
        }
    }

    // Navigation Methods - FIXED: Proper slide navigation
    goToSlide(index) {
        console.log(`🎯 Navigating to slide ${index}`);
        
        if (index < 0 || index >= this.state.totalSlides) {
            console.error(`❌ Invalid slide index: ${index}`);
            return;
        }
        
        if (this.state.isTransitioning) {
            console.log(`⏳ Navigation blocked - transition in progress`);
            return;
        }
        
        if (index === this.state.currentSlide) {
            console.log(`Already on slide ${index}`);
            return;
        }

        this.state.isTransitioning = true;
        const previousSlide = this.state.currentSlide;
        this.state.currentSlide = index;

        // Calculate translation for 4 slides (25% each) - FIXED
        const translateX = -index * 25;
        if (this.refs.slidesWrapper) {
            this.refs.slidesWrapper.style.transform = `translateX(${translateX}%)`;
            console.log(`📐 Slide transform: translateX(${translateX}%)`);
        } else {
            console.error('❌ slidesWrapper not found');
        }

        // Update navigation - FIXED
        this.updateNavigation(index);

        // Update slide visibility - FIXED
        this.updateSlideVisibility(index);

        // Reset transition lock
        setTimeout(() => {
            this.state.isTransitioning = false;
            console.log(`✅ Successfully navigated from slide ${previousSlide} to slide ${index}`);
        }, this.config.transitionDuration);
    }

    updateSlideVisibility(activeIndex) {
        const slides = document.querySelectorAll('.slide');
        console.log(`🔄 Updating slide visibility - active: ${activeIndex}, total slides: ${slides.length}`);
        
        slides.forEach((slide, index) => {
            if (index === activeIndex) {
                slide.classList.add('active');
                console.log(`✅ Slide ${index} set to active`);
            } else {
                slide.classList.remove('active');
            }
        });
    }

    nextSlide() {
        const nextIndex = (this.state.currentSlide + 1) % this.state.totalSlides;
        this.goToSlide(nextIndex);
    }

    previousSlide() {
        const prevIndex = (this.state.currentSlide - 1 + this.state.totalSlides) % this.state.totalSlides;
        this.goToSlide(prevIndex);
    }

    updateNavigation(activeIndex) {
        if (this.refs.navItems && this.refs.navItems.length > 0) {
            this.refs.navItems.forEach((item, index) => {
                if (index === activeIndex) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            console.log(`🧭 Navigation updated - active: ${activeIndex}`);
        } else {
            console.warn('⚠️ No nav items found for update');
        }
    }

    // Geolocation Methods
    initGeolocation() {
        console.log('🧭 Initializing geolocation system...');
        
        this.state.location.status = 'detecting';
        this.updateLocationDisplay();
        
        if (!navigator.geolocation) {
            console.warn('⚠️ Geolocation not supported');
            this.handleGeolocationError({ code: 'GEOLOCATION_NOT_SUPPORTED' });
            return;
        }

        setTimeout(() => {
            navigator.geolocation.getCurrentPosition(
                (position) => this.handleGeolocationSuccess(position),
                (error) => this.handleGeolocationError(error),
                this.config.geolocation
            );
        }, 1000);
    }

    handleGeolocationSuccess(position) {
        if (this.state.location.isManualMode) return;

        
        
        this.state.location = {
            ...this.state.location,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp),
            status: 'active',
            source: 'gps'
        };

        this.updateLocationDisplay();
        this.updateLocationName();
    }

    handleGeolocationError(error) {
        if (this.state.location.isManualMode) return;

        console.warn('⚠️ Geolocation error:', error);
        this.state.location = {
            ...this.state.location,
            status: 'error',
            source: 'gps'
        };
        this.updateLocationDisplay();
    }

    updateLocationName() {
        const { latitude, longitude } = this.state.location;
        if (!latitude || !longitude) return;

        // Simulate reverse geocoding with predefined maritime regions
        let newLocationName = 'Unknown Waters';
        
        for (const region of this.data.locationRegions) {
            const { bounds } = region;
            if (latitude >= bounds.latMin && latitude <= bounds.latMax &&
                longitude >= bounds.lngMin && longitude <= bounds.lngMax) {
                newLocationName = region.name;
                break;
            }
        }

        this.state.location.locationName = newLocationName;
        if (this.refs.locationName) {
            this.refs.locationName.textContent = newLocationName;
        }
    }

    toggleManualLocationInput() {
        console.log('📍 Toggling manual location input');
        const isHidden = this.refs.manualInputs && this.refs.manualInputs.classList.contains('hidden');
        
        if (isHidden) {
            if (this.refs.manualInputs) this.refs.manualInputs.classList.remove('hidden');
            if (this.refs.toggleManualBtn) {
                this.refs.toggleManualBtn.textContent = '📍 Hide Manual Entry';
                this.refs.toggleManualBtn.classList.add('active');
            }
            
            if (this.state.location.latitude && this.state.location.longitude && !this.state.location.isManualMode) {
                if (this.refs.latitudeInput) this.refs.latitudeInput.value = this.state.location.latitude.toFixed(6);
                if (this.refs.longitudeInput) this.refs.longitudeInput.value = this.state.location.longitude.toFixed(6);
            }
        } else {
            if (this.refs.manualInputs) this.refs.manualInputs.classList.add('hidden');
            if (this.refs.toggleManualBtn) {
                this.refs.toggleManualBtn.textContent = '📍 Enter Manually';
                this.refs.toggleManualBtn.classList.remove('active');
            }
            if (this.refs.inputValidation) this.refs.inputValidation.textContent = '';
        }
    }

    validateCoordinateInputs() {
        if (!this.refs.latitudeInput || !this.refs.longitudeInput) return false;
        
        const lat = parseFloat(this.refs.latitudeInput.value);
        const lon = parseFloat(this.refs.longitudeInput.value);
        
        let isValid = true;
        let errorMessage = '';

        this.refs.latitudeInput.classList.remove('invalid');
        this.refs.longitudeInput.classList.remove('invalid');

        if (this.refs.latitudeInput.value && (isNaN(lat) || lat < -90 || lat > 90)) {
            this.refs.latitudeInput.classList.add('invalid');
            errorMessage = 'Latitude must be between -90 and 90 degrees';
            isValid = false;
        }

        if (this.refs.longitudeInput.value && (isNaN(lon) || lon < -180 || lon > 180)) {
            this.refs.longitudeInput.classList.add('invalid');
            errorMessage = 'Longitude must be between -180 and 180 degrees';
            isValid = false;
        }

        if (this.refs.latitudeInput.value && this.refs.longitudeInput.value && !isNaN(lat) && !isNaN(lon)) {
            if (this.refs.inputValidation) this.refs.inputValidation.textContent = '';
            if (this.refs.updateLocationBtn) this.refs.updateLocationBtn.disabled = false;
        } else if (errorMessage) {
            if (this.refs.inputValidation) this.refs.inputValidation.textContent = errorMessage;
            if (this.refs.updateLocationBtn) this.refs.updateLocationBtn.disabled = true;
        } else {
            if (this.refs.inputValidation) this.refs.inputValidation.textContent = 'Please enter both latitude and longitude';
            if (this.refs.updateLocationBtn) this.refs.updateLocationBtn.disabled = true;
        }

        return isValid;
    }

    updateManualLocation() {
        if (!this.validateCoordinateInputs()) return;

        const lat = parseFloat(this.refs.latitudeInput.value);
        const lon = parseFloat(this.refs.longitudeInput.value);

        this.stopGpsTracking();

        this.state.location = {
            ...this.state.location,
            latitude: lat,
            longitude: lon,
            accuracy: null,
            timestamp: new Date(),
            status: 'active',
            source: 'manual',
            isManualMode: true,
            this:fetchForecastData(lat, lon)
    };

        this.updateLocationDisplay();
        this.updateLocationName();
    }

    resetToGpsMode() {
        if (this.refs.latitudeInput) this.refs.latitudeInput.value = '';
        if (this.refs.longitudeInput) this.refs.longitudeInput.value = '';
        if (this.refs.inputValidation) this.refs.inputValidation.textContent = '';
        if (this.refs.updateLocationBtn) this.refs.updateLocationBtn.disabled = true;

        if (this.refs.manualInputs) this.refs.manualInputs.classList.add('hidden');
        if (this.refs.toggleManualBtn) {
            this.refs.toggleManualBtn.textContent = '📍 Enter Manually';
            this.refs.toggleManualBtn.classList.remove('active');
        }

        this.state.location.isManualMode = false;
        this.state.location.source = 'gps';
        this.state.location.status = 'detecting';

        this.updateLocationDisplay();
        this.initGeolocation();
    }

    stopGpsTracking() {
        if (this.state.location.watchId !== null) {
            navigator.geolocation.clearWatch(this.state.location.watchId);
            this.state.location.watchId = null;
        }
    }

    updateLocationDisplay() {
        if (!this.refs.locationItem || !this.refs.locationValue || !this.refs.locationDetail) return;

        const { status, latitude, longitude, accuracy, timestamp, source, isManualMode } = this.state.location;
        
        this.refs.locationItem.className = 'condition-item primary';
        
        switch (status) {
            case 'detecting':
                this.refs.locationItem.classList.add('detecting');
                this.refs.locationValue.textContent = 'Detecting...';
                this.refs.locationDetail.textContent = 'GPS Status: Connecting';
                this.updateNavCoordinates('Detecting position...');
                break;
                
            case 'active':
                if (isManualMode || source === 'manual') {
                    this.refs.locationItem.classList.add('manual-mode');
                    this.refs.locationValue.textContent = this.formatCoordinates();
                    this.refs.locationDetail.textContent = 'Manual Position • Click to modify';
                } else {
                    this.refs.locationItem.classList.add('gps-active');
                    this.refs.locationValue.textContent = this.formatCoordinates();
                    
                    let detailText = 'GPS Active';
                    if (accuracy) detailText += ` • Accuracy: ${Math.round(accuracy)}m`;
                    if (timestamp) {
                        const timeAgo = Math.round((Date.now() - timestamp.getTime()) / 1000);
                        detailText += timeAgo < 60 ? ' • Just now' : ` • ${Math.round(timeAgo / 60)}m ago`;
                    }
                    
                    this.refs.locationDetail.textContent = detailText;
                }
                
                this.updateNavCoordinates(this.formatCoordinates());
                break;
                
            case 'error':
            default:
                this.refs.locationItem.classList.add('gps-error');
                this.refs.locationValue.textContent = 'Location Unavailable';
                this.refs.locationDetail.textContent = this.config.fallbackMessage;
                this.updateNavCoordinates('Position unknown');
                break;
        }
    }

    updateNavCoordinates(text) {
        if (this.refs.navCoordinates) {
            this.refs.navCoordinates.textContent = text;
            
            if (text.includes('Detecting') || text.includes('unknown')) {
                this.refs.navCoordinates.style.color = 'var(--maritime-warning)';
            } else if (text.includes('°')) {
                this.refs.navCoordinates.style.color = 'var(--maritime-success)';
            } else {
                this.refs.navCoordinates.style.color = 'var(--maritime-text-secondary)';
            }
        }
    }

    formatCoordinates() {
        const { latitude, longitude } = this.state.location;
        
        if (latitude === null || longitude === null) return 'Unknown Position';
        
        const latDir = latitude >= 0 ? 'N' : 'S';
        const lonDir = longitude >= 0 ? 'E' : 'W';
        
        return `${Math.abs(latitude).toFixed(4)}°${latDir}, ${Math.abs(longitude).toFixed(4)}°${lonDir}`;
    }

    // Touch and Navigation
    initTouchEvents() {
        const slidesWrapper = this.refs.slidesWrapper;
        if (!slidesWrapper) return;

        slidesWrapper.addEventListener('touchstart', (e) => {
            this.state.touchStartX = e.touches[0].clientX;
        }, { passive: true });

        slidesWrapper.addEventListener('touchend', (e) => {
            this.state.touchEndX = e.changedTouches[0].clientX;
            this.handleSwipeGesture();
        }, { passive: true });
    }

    handleSwipeGesture() {
        const swipeDistance = this.state.touchStartX - this.state.touchEndX;
        
        if (Math.abs(swipeDistance) > this.config.touchThreshold) {
            if (swipeDistance > 0) {
                this.nextSlide();
            } else {
                this.previousSlide();
            }
        }
    }

    // Chart Initialization
    initCharts() {
        if (typeof Chart === 'undefined') {
            console.warn('⚠️ Chart.js not available');
            return;
        }

        Chart.defaults.color = this.config.maritimeColors.textSecondary;
        Chart.defaults.borderColor = 'rgba(176, 190, 197, 0.1)';

        setTimeout(() => {
            this.initForecastChart();
            this.initTodayChart();
            this.initDetectionChart();
        }, 100);
    }

    initForecastChart() {
        const ctx = this.refs.forecastChart?.getContext('2d');
        if (!ctx) return;

        this.state.charts.forecast = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Today', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'],
                datasets: [
                    {
                        label: 'Temperature (°C)',
                        data: this.data.chartData.forecast.temperature,
                        borderColor: this.config.chartColors[0],
                        backgroundColor: this.config.chartColors[0] + '20',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Wave Height (m)',
                        data: this.data.chartData.forecast.waveHeight,
                        borderColor: this.config.chartColors[2],
                        backgroundColor: this.config.chartColors[2] + '20',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: this.config.maritimeColors.textSecondary,
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(176, 190, 197, 0.1)' },
                        ticks: { color: this.config.maritimeColors.textSecondary }
                    },
                    y: {
                        position: 'left',
                        grid: { color: 'rgba(176, 190, 197, 0.1)' },
                        ticks: { 
                            color: this.config.maritimeColors.textSecondary,
                            callback: (value) => value + '°C'
                        }
                    },
                    y1: {
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ticks: { 
                            color: this.config.maritimeColors.textSecondary,
                            callback: (value) => value + 'm'
                        }
                    }
                }
            }
        });
    }

    initTodayChart() {
        const ctx = this.refs.todayChart?.getContext('2d');
        if (!ctx) return;

        this.state.charts.today = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.data.chartData.todayHourly.labels,
                datasets: [
                    {
                        label: 'Temperature (°C)',
                        data: this.data.chartData.todayHourly.temperature,
                        borderColor: this.config.chartColors[0],
                        backgroundColor: this.config.chartColors[0] + '20',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Wind Speed (kt)',
                        data: this.data.chartData.todayHourly.windSpeed,
                        borderColor: this.config.chartColors[1],
                        backgroundColor: this.config.chartColors[1] + '20',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: this.config.maritimeColors.textSecondary,
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(176, 190, 197, 0.1)' },
                        ticks: { color: this.config.maritimeColors.textSecondary }
                    },
                    y: {
                        position: 'left',
                        grid: { color: 'rgba(176, 190, 197, 0.1)' },
                        ticks: { 
                            color: this.config.maritimeColors.textSecondary,
                            callback: (value) => value + '°C'
                        }
                    },
                    y1: {
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ticks: { 
                            color: this.config.maritimeColors.textSecondary,
                            callback: (value) => value + 'kt'
                        }
                    }
                }
            }
        });
    }

    initDetectionChart() {
        const ctx = this.refs.detectionChart?.getContext('2d');
        if (!ctx) return;

        this.state.charts.detection = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.data.chartData.detection.labels,
                datasets: [
                    {
                        label: 'Storm Detection %',
                        data: this.data.chartData.detection.stormDetection,
                        backgroundColor: this.config.chartColors[0] + '80',
                        borderColor: this.config.chartColors[0],
                        borderWidth: 1
                    },
                    {
                        label: 'Swell Detection %',
                        data: this.data.chartData.detection.swellDetection,
                        backgroundColor: this.config.chartColors[1] + '80',
                        borderColor: this.config.chartColors[1],
                        borderWidth: 1
                    },
                    {
                        label: 'Fog Detection %',
                        data: this.data.chartData.detection.fogDetection,
                        backgroundColor: this.config.chartColors[2] + '80',
                        borderColor: this.config.chartColors[2],
                        borderWidth: 1
                    },
                    {
                        label: 'Current Alert %',
                        data: this.data.chartData.detection.currentAlert,
                        backgroundColor: this.config.chartColors[3] + '80',
                        borderColor: this.config.chartColors[3],
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: this.config.maritimeColors.textSecondary,
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(176, 190, 197, 0.1)' },
                        ticks: { color: this.config.maritimeColors.textSecondary }
                    },
                    y: {
                        grid: { color: 'rgba(176, 190, 197, 0.1)' },
                        ticks: { 
                            color: this.config.maritimeColors.textSecondary,
                            callback: (value) => value + '%'
                        },
                        min: 80,
                        max: 100
                    }
                }
            }
        });
    }

    // Utility Methods
    populateData() {
        setTimeout(() => {
            const confidenceFill = document.querySelector('.confidence-fill');
            if (confidenceFill) {
                confidenceFill.style.width = '0%';
                setTimeout(() => {
                    confidenceFill.style.width = this.data.weatherConfidence.overall + '%';
                }, 300);
            }
        }, 500);
    }

    updatePeriodButtons(activeBtn) {
        if (this.refs.periodBtns && this.refs.periodBtns.length > 0) {
            this.refs.periodBtns.forEach(btn => btn.classList.remove('active'));
            activeBtn.classList.add('active');
        }
    }

    showEmergencyNotification() {
        if (this.refs.emergencyModal) {
            this.refs.emergencyModal.classList.remove('hidden');
        }
    }

    hideEmergencyModal() {
        if (this.refs.emergencyModal) {
            this.refs.emergencyModal.classList.add('hidden');
        }
    }

    handleKeyboardNavigation(e) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.previousSlide();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextSlide();
                break;
            case '1': this.goToSlide(0); break;
            case '2': this.goToSlide(1); break;
            case '3': this.goToSlide(2); break;
            case '4': this.goToSlide(3); break;
            case 'Escape':
                this.hideEmergencyModal();
                this.hideAuthModal();
                break;
        }
    }

    handleResize() {
        Object.values(this.state.charts).forEach(chart => {
            if (chart && chart.resize) {
                chart.resize();
            }
        });
    }

    animateEntrance() {
        const elements = [
            { selector: '.confidence-card', delay: 200 },
            { selector: '.conditions-card', delay: 400 },
            { selector: '.alerts-card', delay: 600 },
            { selector: '.optimization-card', delay: 800 }
        ];

        elements.forEach(({ selector, delay }) => {
            setTimeout(() => {
                document.querySelectorAll(selector).forEach((el, index) => {
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(30px)';
                    el.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                    
                    setTimeout(() => {
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }, delay);
        });
    }

    cleanup() {
        this.stopGpsTracking();
        Object.values(this.state.charts).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
    }


    async fetchForecastData(lat, lon) {
        try {
            const response = await fetch(`/weather/forecast/?lat=${lat}&lon=${lon}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log("🌤 Forecast API data:", data);
    
            const labels = (data.forecast || []).map(item => item.dt_txt);
            const temps = (data.forecast || []).map(item => item.main?.temp ?? null);
            const winds = (data.forecast || []).map(item => item.wind?.speed ?? null);
            const pressures = (data.forecast || []).map(item => item.main?.pressure ?? null);
    
            this.data.chartData.forecast.temperature = temps;
            this.data.chartData.forecast.waveHeight = (data.forecast || []).map(() => Math.random() * 3);
            this.data.chartData.todayHourly.labels = labels;
            this.data.chartData.todayHourly.temperature = temps;
            this.data.chartData.todayHourly.windSpeed = winds;
            this.data.chartData.todayHourly.pressure = pressures;
    
            this.updateCharts();
        } catch (error) {
            console.error("❌ Failed to fetch forecast:", error);
        }
    }
}

// Initialize the application - No authentication required
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌊 DOM Ready - Starting Maritime AI (Authentication Optional)...');
    window.MaritimeApp = new MaritimeAI();
});

// Performance and lifecycle management
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`⚡ Total load time: ${loadTime.toFixed(2)}ms`);
    console.log('🎯 Maritime AI fully loaded - All features available without login');
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('📱 App hidden - pausing updates');
    } else {
        console.log('📱 App visible - resuming updates');
        if (window.MaritimeApp && window.MaritimeApp.state.location.status === 'active') {
            window.MaritimeApp.updateLocationDisplay();
        }
    }
});

window.addEventListener('beforeunload', () => {
    if (window.MaritimeApp && window.MaritimeApp.cleanup) {
        window.MaritimeApp.cleanup();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MaritimeAI;
}