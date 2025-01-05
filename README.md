# 🍪 Cookie-Manager
Cookie Manager - Import/Export your website cookies to another browser! (Browser Extension)

What is it for? - Say, you are migrating from one device/browser/profile to another and only want to bring a fraction of *cookies* with you.
This solution is one little layer of security when transferring your sessions somewhere else - data is encrypted and the complexity depends solely on the end user.

Initial use-case is to export your cookies, move them to a flash drive, import cookies from the flash drive on another device and delete exported files from the flash drive.

## Functionality
This browser extension grabs raw cookies from the last opened website, encrypts it with specified password utilizing `AES-GCM` algorithm, and creates a file that can be saved anywhere on the drive.

### Limitations
- Currently, Chrome Browser is not allowing `cookies` method to impact incognito mode, therefore extension is force-disabled in incognito
- Not all websites will work with current implementation, some of them(like `nexusmods.com`) will not be affected by this extension due to higher authorisation complexity. Most of the pop websites could be exported/imported with no issues
- Password must be re-entered each time, making it susceptible to shoulder surfing
- No backup mechanism if password is forgotten
- Not recommended to use with finance apps (e.g. online banking, stocks, exchanges, so on)


## User Interface
This project has a very lightweight design and functionality: three buttons and one input field.

![Alt](https://i.ibb.co/VHFkGp6/image-6.png)

- `Import Cookies` button imports previously exported cookies to current website
- `Export Cookies` button exports cookies from the current website
- `Clear Cookies` button clears all cookies for current website
- `Password` field is reserved for Import/Export function to encrypt the password: set it as anything but none.



## Tested Environment
Windows 10 x64, Chrome 131.0.6778.85

Feel free to use this project however you want, keep in mind - you are the only one who's responsible for your data.
This project contains no malware, no xar/fetch requests or other hidden malicious activity. It's always best to review the code to settle yourself before installing anything. 
