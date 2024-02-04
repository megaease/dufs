## API

* NOTE: All `path` means the path of the file or directory.

### multiple download

```text
POST /multiple_download
JSON
{
    "dir": "path/to/dir",
    "files": ["file1 name", "file2 name", "file3 name"]
}
```

### package and download (path should be a dir)

```text
GET /path?zip
```

### search file (path should be a dir)

```text
GET /path?q=<filename>
```

### calculate file size in a dir (path should be a dir)

```text
GET /path?statistic
```

### list files in a dir (path should be a dir)

```text
GET /path
```

### edit file (path should be a file)

```text
GET /path?edit
```

### view file (path should be a file)

```text
GET /path?view
```

### download file (path should be a file)

```text
GET /path
```

### upload file (path should be a file)

```text
PUT /path
```

### range upload file (path should be a file)

```text
PATCH /path
```

### delete file or dir (path should be a file or dir)

```text
DELETE /path
```

### profind file or dir (path should be a file or dir)

```text
PROFIND /path
```

### propatch file (path should be a file)

```text
PROPATCH /path
```

### create a file or dir (path should be a dir or file)

```text
MKCOL /path
```

### copy file or dir (path should be a file or dir)

```text
COPY /path
```

### move file or dir (path should be a file or dir)

```text
MOVE /path
```

### unzip file (path should be a file)

```text
GET /path?unzip
```
