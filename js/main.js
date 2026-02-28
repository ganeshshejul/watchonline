document.addEventListener('DOMContentLoaded', function () {
    const tabButtons = document.querySelectorAll('.tab-button');
    let currentTab = 'all'; // Changed default to 'all'

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            // Update current tab
            currentTab = button.dataset.tab;
            // Clear input field
            document.getElementById('imdbInput').value = '';
            // Update placeholder based on tab
            let placeholderText = 'Enter IMDb ID';
            if (currentTab === 'movies') placeholderText = 'Enter Movie IMDb ID';
            if (currentTab === 'series') placeholderText = 'Enter Series IMDb ID';
            if (currentTab === 'all') placeholderText = 'Enter IMDb ID';
            document.getElementById('imdbInput').placeholder = placeholderText;
        });
    });

    const IndStreamPlayerConfigs = {
        width: 380,
        height: 280,
        id: 'IndStreamPlayer',
        tr: false
    };

    const VidSrcDomain = 'https://vidsrcme.ru';
    const VinoStreamDomain = 'https://lethe399key.com';
    let initIndStreamPlayer = false;

    document.getElementById('playButton').addEventListener('click', function () {
        const imdbID = document.getElementById('imdbInput').value.trim();
        if (!imdbID) {
            alert('Please enter a valid IMDb ID.');
            return;
        }

        let streamUrl;
        if (currentTab === 'all') {
            // For 'Movies & Series' tab, use Vino stream
            streamUrl = `${VinoStreamDomain}/play/${imdbID}`;
            // Use AJAX for Vino stream
            VinoStreamAjax(streamUrl, () => {
                loadIframe(streamUrl);
            }, () => {
                alert('Wait 10-15 Seconds After Clicking On Play');
            });
        } else if (currentTab === 'movies') {
            // Use VidSrc movies endpoint
            streamUrl = `${VidSrcDomain}/embed/movie/${imdbID}`;
            loadIframe(streamUrl);
        } else if (currentTab === 'series') {
            // Use VidSrc TV/series endpoint
            streamUrl = `${VidSrcDomain}/embed/tv/${imdbID}`;
            loadIframe(streamUrl);
        }
    });

    function loadIframe(url) {
        const playerContainer = document.getElementById(IndStreamPlayerConfigs.id);
        playerContainer.innerHTML = ''; // Clear previous iframe if any

        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', url);
        iframe.setAttribute('width', IndStreamPlayerConfigs.width);
        iframe.setAttribute('height', IndStreamPlayerConfigs.height);
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', 'true');

        playerContainer.appendChild(iframe);

        // Feedback while loading the iframe
        iframe.onload = function () {
            console.log('Iframe loaded successfully.');
        };

        iframe.onerror = function () {
            playerContainer.innerHTML = '<p style="color:white;">Error loading the stream. Please try again.</p>';
        };
    }

    function VinoStreamAjax(url, success, error) {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    if (typeof success === 'function') success();
                } else {
                    if (typeof error === 'function') error();
                }
            }
        };
        xhr.open('GET', url, true);
        xhr.send(null);
    }

    if (window.addEventListener) {
        window.addEventListener('message', listener);
    } else {
        window.attachEvent('onmessage', listener);
    }

    function listener(event) {
        if (event.origin === VinoStreamDomain && !initIndStreamPlayer) {
            if (event.data && event.data.event) {
                const playerContainer = document.getElementById(IndStreamPlayerConfigs.id);
                
                if (event.data.event === 'init') {
                    initIndStreamPlayer = true;
                } else if (event.data.event === 'error' && playerContainer) {
                    playerContainer.innerHTML = ''; // Clear content
                }
            }
        }
    }
});
