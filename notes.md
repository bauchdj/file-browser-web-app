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
