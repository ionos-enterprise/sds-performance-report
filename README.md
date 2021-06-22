### Test page on a local machine
```
Start http server inside directory the repo is checked out into:
$python3 -m http.server 8080
then open http://127.0.0.1:8080 in your browser

In order to start http server on a particular interface of
a remote machine use
# python3 -m http.server 8080 -b <IP>
Open http://<IP>:8080 in the browser

```

### The following files must be created:

```
-> data
    -> images/
    -> images/report-march/...
    -> images/report-june/...
    -> files.json
    -> report-march.json
    -> report-june.json
```

### files.json
```
{
    "files": [
        {
            "title": "March Measurment",
            "file": "report-march.json",
            "details": "This is first line\n This is another line"
        },
        {
            "title": "June Measurment",
            "file": "report-june.json",
            "details": "This is first line\n This is another line"
        }
    ]
}
```


### report-march.json
```
{
    "40 CPUs": {
        "Dual Path": {
            "Multiple Disks": [
                {
                    "url": "disks-x4-dual_write-iops.svg",
                    "tags": ["Write IOPS"]
                }
            ],
            "Multiple Jobs": [
                {
                    "url": "jobs-x4-dual_write-iops.svg",
                    "tags": ["Write IOPS"]
                }
            ]
        },
        "Single Path": {
            "Multiple Disks": [],
            "Multiple Jobs": []            
        }
    }, 
    "64 CPUs": {
        "Dual Path": {
            "Multiple Disks": [],
            "Multiple Jobs": []
        }
    }
}
```
