# Private File Browser / File Sharing

### Elevator pitch

If you're like me, you have photos, videos and files you want to access and share privately. With some technical know how and a few dollars a month you could host your own server and have all your files stored safely on the cloud accessible through any browser. Cloud services are expensive and there's no way to gaurentee your infomation is private. Plus, they require other people to have an account to access any files you share. In general, storing files and sharing them is tough. I plan on making self hosted cloud storage and file sharing easy and simple, whether it be from a laptop or mobile device.

### Design

![Mock](mockup.png)

### Key features

- Secure login over HTTPS
- Mobile and Desktop friend design.
- Ability to select multiple files and make custom shared collections available to guests.
- Download multiple files as zip file or separate, singular, files back to back.
- Regular and Regex file search.
- File system management built on Nodejs.

### Technologies

- **HTML** - Simple, clean HTML structure for home page and login page.
- **CSS** - Application styling that looks good on different screen sizes, color scheme, vivid and intuitive buttons.
- **JavaScript** - Provides login, window resizing, Nodejs file management, dynamic file column sorting.
- **Service** - Uses api to get icon and name based on file extension.
- **DB** - Store users credentials.
- **Login** - Register and login users. Credentials securely stored in database. Only users can access file directory and secured file collections.
- **WebSocket** - Every directory will show a **live** list of viewers.
- **React** - Application ported to use the React web framework.

# HTML deliverable

- **HTML pages** - Two HTML pages. File browsing and login page. Shared files will still use index.html, however they will be limited to "Guest" permissions. The "Shared" button will take you to the root directory for guests. This will be handled by JavaScript.
- **Links** - The login page automatically links to the root directory. Password requires at least one letter and one number.
- **Text** - File metadata and details placeholders.
- **Images** - Header icon. File type icons placeholders.
- **Login** - Input box and submit button for login.
- **Database** - Users credentials used at login, and username displayed in header after login.
- **WebSocket** - Box that shows all **viewers live** in that currenty directory (viewers with same directory path).

# CSS deliverable

- **Header, footer, and main content body** - 
- **Navigation elements** - 
- **Responsive to window resizing** - My app looks great on all window sizes and devices
- **Application elements** - Used good contrast and whitespace
- **Application text content** - Consistent fonts
- **Application images** - 

# JavaScript deliverable

- **login** - When you press enter or the login button it takes you to your root folder.
- **database** - 
- **WebSocket** - 
- **application logic** -

# Service deliverable

- **Node.js/Express HTTP service** - 
- **Static middleware for frontend** - 
- **Calls to third party endpoints** - Serve up icon based on file type.
- **Backend service endpoints** - 
- **Frontend calls service endpoints** - 

## DB deliverable

- **MongoDB Atlas database created** - 
- **Endpoints for data** - 
- **Stores data in MongoDB** - 

# Login deliverable

- **User registration** - Creates a new account in the database.
- **existing user** - 
- **Use MongoDB to store credentials** - Store login credentials
- **Restricts functionality** - 

# WebSocket deliverable

- **Backend listens for WebSocket connection** - 
- **Frontend makes WebSocket connection** - 
- **Data sent over WebSocket connection** - 
- **WebSocket data displayed** - 

# React deliverable

- **Bundled and transpiled** - 
- **Components** - 
- **Router** - 
- **Hooks** - 
