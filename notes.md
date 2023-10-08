### Current Ideas List

May need api for file type icons + technical name _(.py is python, etc)_

## HTML
- Buttons: Account & Settings, Home, Log out, column sort button, on hover copy path.
- Text: Path bar at top, File + Directory count at top, Storage used, Columns by file name + date modified + date created (if possible) + size.
- Input: Edit file path manually _(JS check for valid path, pop up if error)_, regular / regex search, select boxes _(first column)_.
- Show **options** bar when item(s) are selected.
- Sidebar: Home (root directory), Shared, Trash, + Add Current Path _(organized by when added)_
- Columns: Select boxes, Name, Modified, Creation, Size, Type _(make order rearrangeable)_
- Details box: Icon, list of details _(atime, mtime, ctime)_ _(Ex. Modified: 09/19/2023 at 9:53AM)_

## Drop down / pop up menus / options
- Add New Button: New folder, Blank Text file, Upload Folder, Upload files, Link to file, Link to folder (downloads directly to server)
- Folder & File options: Download, Rename, Trash, Delete, Create link _or_ Copy Link _(if link exists)_, Move to, Copy to, Symbolically link to, Details
- Multi-selected options: Download, Move to, Copy to, Trash, Delete, Symbolically link to
- Details: Type, Modified, Creation, Path _(copy path)_, Size, Create link _or_ Copy Link _(if link exists)_
 
## JavaScript
- Sorting: Type, Name, Modified Date, Creation Date, Size _(Ascending & Descending)_
- Searching: Regular find, Regex
- Trash: If file exists, create hidden file with filename + '-date-time' and put file inside that directory. Need system to handle duplicates.
- Filemeta data: What info can I get on linux?
- Drag and drop?
- Websocket: Have box that displays live connection to server. Guarantees upload and connection = confidence in file management in the browser.

## Settings
- Hidden files _(hide / show)_
- Put Folders at the top despite sorting
- Default sorting
- Default column order, _(arrangemnet)_
- Default column widths
- Manage sidebar locations. _(Rearrange the order too)_
- Single click to select or open
- 12hr or 24hr format
- Use KB (1000 bytes) or KiB (1024 bytes) for file size

### GitHub Merging Conflicts
This is the key to merging the conflicts after you select what to keep.
```
git commit -am "merge(notes) combined both edits"
```

### History of the Web
1. The formation of the internet that supports the communication of web applications
1. The creation of HTML and HTTP that made it possible to shared hyperlinked documents (Web 1.0).
1. The creation of CSS and JavaScript that enabled interactive web applications (Web 2.0).

## Internet

The essential first step to enabling what we now call web programming was the formation of a global communications network that was reliable and publicly available. This was made possible when the United States Department of Defense created the ARPANET as a means of sharing information between universities doing defense related research.

ARPANET was defined with the goal of withstanding a nuclear attack. This led to the implementation of a redundantly connected graph of computing devices. Within that network, two computers communicate by dynamically discovering a path to each other without the help of a single central authority.

In the 1980s the National Science Foundation continued the expansion of the network, and commercial enterprises began to make significant contributions. This eventually led to the Internet as we know it today, as the world went online as part of a massive explosion of consumer participation in the early 1990s. This was followed by another exponential increase in the 2000s as smart phones and appliances became common.

The management of the Internet is controlled by two major organizations. The Internet Engineering Task Force (IETF) defines the technical standards that specify how the physical network communicates. The Internet Corporation for Assigned Names and Numbers (ICANN) oversees both the Internet Protocol address space, and the Domain Name System. These two databases form the address book of the Internet. When the United States government transitioned control of these governing bodies to a global community of non-profit stake holders in 2016, the Internet became a worldwide asset free from any specific political control.

## Hypertext Markup Language (HTML)

“I just had to take the hypertext idea and connect it to the TCP and DNS ideas and—ta-da!—the World Wide Web.”
— Tim Berners-Lee, (**Source**: _Answers for Young People_)

Starting in 1980, Tim Berners-Lee was working at the research laboratory Cern. He was tasked with building a system that would allow researchers to share documents between remote academic institutions. Realizing that the ARPANET provided the necessary connectivity, he defined the protocols for document sharing that formed the underpinning of what would be termed the World Wide Web. Berners-Lee named the document format the HyperText Markup Language based on inspiration from the digital publishing industry's Standard Generalized Markup Language (SGML). One of the key innovations of HTML was the idea that documents could be interconnected with what he termed hyperlinks to allow immediate access to related documents. In 1990 he put all the pieces together and built the world's first web server on his desktop NeXT computer. You can visit a reproduction of the first web site at.

Originally, HTML contained only 18 elements, or tags. The latest version of HTML has now grown to over 100. The initial explosion of elements was caused in part by browser vendors racing to create differentiating functionality in order to gain market share. Since 1996 the HTML specification has been controlled by the W3C. The following is an example of a simple HTML document.

## HTTP and URL
While HTML was an incredible step forward, Berners-Lee also made other significant contributions. This included the definition of the HyperText Transfer Protocol. These two definitions specify how web documents are addressed and transmitted across the Internet. The following gives an example of a URL and HTTP request.

## Cascading Style Sheets (CSS)
Cascading Style Sheets was first proposed in 1994 by Håkon Wium Lie, a contemporary of Berners-Lee at CERN, in order to give HTML documents visual styling independent of the content's structure. Before the introduction of CSS, HTML was going down the path of hard coding the visual appearance of the content with HTML elements. This would have resulted in a single visual style for the entire web that was completely defined by the browser vendors.

“If we hadn’t developed CSS, we could have ended up with the web being a giant fax machine”
— Håkon Wium Lie (**Source**: _Medium.com_)

By 1996 CSS became a standard and all the major browsers began to implement the functionality. Unfortunately, for the first years of CSS the same proprietary wars that plagued HTML also affected CSS. Much of the work on version 2.1 was to remove error and make all the features of CSS compatible.

The ability of CSS to style a web page has increased significantly from its original implementation. With modern CSS a web programmer can import fonts, animate HTML elements, respond to user actions, and dynamically alter the entire layout of the page based on the size of a device and its orientation.

## JavaScript
In 1995 Netscape (the maker of the popular browser Navigator) decided to add the ability to script web pages. The initial implementation was led by Brendan Eich and given the name JavaScript. JavaScript turned the previously static web into an interactive experience where a web page could dynamically change based upon a user's interaction.

“Always bet on JS”
— Brendan Eich (**Source**: _brendaneich.github.io_)

In 1996 Netscape turned control of JavaScript over to ECMA International in an attempt to standardize the definition of the language. At that point JavaScript officially became know as ECMAScript, although it is still commonly referred to as JavaScript.

The first decade of JavaScript was turbulent as each of the major browser vendors attempted to introduce new proprietary features in order to gain market share. Eventually in 2009 the major vendors agreed on the ECMAScript 5 standard and in 2015 ECMAScript 6 was released as the last major feature upgrade. Since then minor releases have taken the year of their release as their version number.

### JavaScript outside the browser
In 2009 Ryan Dahl created Node.js as the first successful application for deploying JavaScript outside of a browser. This changed the mindset of JavaScript as purely a browser technology to one that is leveraged across an entire technology stack.

Other important milestones in the history of JavaScript include the 2013 standardization of the common object notation JSON, a typed variant named TypeScript in 2012, and the introduction of numerous transpilers for converting other languages into compatible ECMAScript.

### Technology Stack
The collection of technologies that you use to create or deliver your web application is called a technology stack. It is a stack because they usually layer one on top of each other. Generally at the top of the stack is your web framework. This includes possibilities such as Angular, React, Vue, or Svelte. The web framework then communicates with one or more web services to provide authentication, business, data, and persistent storage. The web service then uses backend services such as caching, database, logging, and monitoring.

Here is what our stack looks like: React for the web framework, talking to Caddy as the web server hosted on AWS, running web services with Node.js, and MongoDB as the database hosted on MongoDB Atlas.

The key with a tech stack is the realization that there is no one answer to the question of what technology to use where, and the answer continually evolves. Usually you will use what the company you work for has invested in. Migrating to a new stack is very expensive and error prone. So learning how to maximize your effectiveness, regardless of the technology, will make you very valuable. Being discontent because the latest new toy is not being used, will usually cause an unnecessary disruption to the team. However, if you can validate that a change in the tech stack will produce significant monetary, performance, or security gains, then you will greatly benefit your team.

## Complex technology stack
Here is an example of a tech stack from a small web application company. You can see that there are dozens of technologies used to make the application work. When you build a commercial stack you want to be very careful about the pieces you choose. Dependability, support, scalability, performance, and security are all important factors. You also want to consider development productivity factors such as documentation, ease of use, common acceptance, community support, build times, and testing integration.

### The Console
Before the creation of graphical user interfaces, all computing systems were simple console environments consisting as of a prompt for inputting a command and the display of the command output. All of the original programming tools ran as console application. The console tradition is still actively used by professional developers and most programming tools execute within a console window.

Also known as the command line, shell, or terminal, the console window is an essential web development tool. The console provides access to the file system and allows for the execution of command line applications.

There are many console applications that you can chose from. All operating systems come with a default console, but you will probably want to install one in order to get the best experience. Here is an example of Warp running on a Mac.

## Executing commands
The other primary purpose of the console is to execute commands. You already did this in the previous section when you executed commands for working with the file system. However, console commands can perform many different operations. Here are some basic commands that you show experiment with.

- echo - Output the parameters of the command
- cd - Change directory
- mkdir - Make directory
- rmdir - Remove directory
- rm - Remove file(s)
- mv - Move file(s)
- cp - Copy files
- ls - List files
- curl - Command line client URL browser
- grep - Regular expression search
- find - Find files
- top - View running processes with CPU and memory usage
- df - View disk statistics
- cat - Output the contents of a file
- less - Interactively output the contents of a file
- wc - Count the words in a file
- ps - View the currently running processes
- kill - Kill a currently running process
- sudo - Execute a command as a super user (admin)
- ssh - Create a secure shell on a remote computer
- scp - Securely copy files to a remote computer
- history - Show the history of commands
- ping - Check if a website is up
- tracert - Trace the connections to a website
- dig - Show the DNS information for a domain
- man - Look up a command in the manual

You can also chain the input and output of commands using special characters
- `|` - Take the output from the command on the left and _pipe_, or pass, it to the command on the right
- `>` - Redirect output to a file. Overwrites the file if it exists
- `>>` - Redirect output to a file. Appends if the file exists

There are also keystrokes that have special meaning in the console.

- CTRL-R - Use type ahead to find previous commands
- CTRL-C - Kill the currently running command

### Caddy
- Routes traffic from 443 to specified ports based on subdomain
- Automatically creates domain certificates useing LetsEncrypt / certbot

### HTMl Structure
- Wrapping elements in div, etc allow you to put elements in relative scope and placement on the page

### HTML Input
There are a lot of different input types. The checkbox will be very helpful for my file browser

### HTML Media
This was good practice since I will be loading raw files (photos, videos) in my file browser at some point.

### Deploying
The deploy script works great. Got simon.talkofchrist.org setup as well. The simon code is helpful because it splits it into 3 main chuncks header, body, footer.

### HTML Structure - Checkpoint #1
- Add icon placeholder for each file - DONE
- Add websocket live update for users in same directory - DONE
- Login page - DONE
- About page - DONE
- Logout button - DONE
- Username credentials stored in databased - DONE
