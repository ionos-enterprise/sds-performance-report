

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