document.addEventListener('DOMContentLoaded', function () {
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const clearBtn = document.getElementById('clearBtn');
    const fileInput = document.getElementById('fileInput');
    const passwordInput = document.getElementById('passwordInput');
    const err = document.querySelector('.err');

    async function isIncognitoWindow() {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0].incognito == true) {
            document.body.innerHTML = `<div style='font-size: 16px;'><h1 style='color: red; width: 100%; text-align: center; margin-bottom: 12px;'>WARNING!</h1><p>Chrome has limited this method to normal mode only - incognito mode is not supported.</p><br><p>Try creating another local browser profile instead.</p></div>`
            return;
        }
    }
    isIncognitoWindow();


    function DisplayError(errText, red = true) {
        err.innerText = errText;
        err.style.opacity = '1';
        if (red == true) { err.style.color = 'rgb(255,96,48)'; }
        else { err.style.color = 'rgb(48,255,96)'; }

        setTimeout(() => {
            err.style.opacity = '0';
        }, 1536);
    }

    async function getCurrentTabUrl() {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        return new URL(tabs[0].url);
    }

    exportBtn.addEventListener('click', async () => {
        try {
            const password = passwordInput.value;
            if (!password) {
                DisplayError('Please enter a password');
                return;
            }

            const url = await getCurrentTabUrl();
            const cookies = await chrome.cookies.getAll({ domain: url.hostname });

            // Encrypt the cookies data
            const encryptedData = await encryptString(JSON.stringify(cookies), password);
            const blob = new Blob([JSON.stringify(encryptedData)], { type: 'application/json' });
            const downloadUrl = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${url.hostname}-cookies-encrypted.json`;
            a.click();

            URL.revokeObjectURL(downloadUrl);
            DisplayError('Cookies imported successfully', false);
        } catch (error) {
            console.error('Export failed:', error);
            DisplayError('Failed to export cookies: ' + error.message);
        }
    });

    importBtn.addEventListener('click', () => {
        if (!passwordInput.value) {
            DisplayError('Please enter a password');
            return;
        }
        fileInput.click();
    });

    fileInput.addEventListener('change', async (event) => {
        try {
            const password = passwordInput.value;
            if (!password) {
                DisplayError('Please enter a password');
                return;
            }

            const file = event.target.files[0];
            if (!file) return;

            const text = await file.text();
            const encryptedData = JSON.parse(text);

            // Decrypt the cookies data
            try {
                const decryptedText = await decryptString(encryptedData, password);
                const cookies = JSON.parse(decryptedText);

                const url = await getCurrentTabUrl();

                const existingCookies = await chrome.cookies.getAll({ domain: url.hostname });
                for (const cookie of existingCookies) {
                    await chrome.cookies.remove({
                        url: `${url.protocol}//${url.hostname}${cookie.path}`,
                        name: cookie.name
                    });
                }

                // Set new cookies
                for (const cookie of cookies) {
                    const cookieData = {
                        url: `${url.protocol}//${url.hostname}${cookie.path}`,
                        name: cookie.name,
                        value: cookie.value,
                        domain: cookie.domain,
                        path: cookie.path,
                        secure: cookie.secure,
                        httpOnly: cookie.httpOnly,
                        sameSite: cookie.sameSite,
                        expirationDate: cookie.expirationDate
                    };

                    try {
                        await chrome.cookies.set(cookieData);
                    } catch (error) {
                        console.error('Failed to set cookie:', cookieData, error);
                    }
                }

                DisplayError('Cookies imported successfully', false);
            } catch (error) {
                DisplayError('Invalid password or corrupted file');
                return;
            }
        } catch (error) {
            console.error('Import failed:', error);
            DisplayError('Failed to import cookies: ' + error.message);
        }
    });

    clearBtn.addEventListener('click', async () => {
        try {
            const url = await getCurrentTabUrl();
            const confirmed = confirm(`Are you sure you want to clear cookies for ${url.hostname}?`);

            if (confirmed) {
                const cookies = await chrome.cookies.getAll({ domain: url.hostname });
                for (const cookie of cookies) {
                    await chrome.cookies.remove({
                        url: `${url.protocol}//${url.hostname}${cookie.path}`,
                        name: cookie.name
                    });
                }
                DisplayError('Cookies cleared successfully', false);
            }
        } catch (error) {
            console.error('Clear failed:', error);
            DisplayError('Failed to clear cookies: ' + error.message);
        }
    });
});