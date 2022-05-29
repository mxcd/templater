# tmpltr - templating files with mustache and YAML
```
__       __                  ____      
\ \     / /_____ ___  ____  / / /______
 \ \   / __/ __ `__ \/ __ \/ / __/ ___/
 / /  / /_/ / / / / / /_/ / / /_/ /    
/_/   \__/_/ /_/ /_/ .___/_/\__/_/     
                  /_/                  
```

## Concept
This tool generates a set of files based on one or more templates in combination with a set of values used as tempalte variables.  
For tempaltes, mustache is used. For the manifest file, YAML is used (`*.yaml` and `*.yml` are equally supported).  
For execution, at least one `*.mustache` template and one `*.yml` manifest file are required.

## Usage
```
tmpltr [workingDirectory] [--manifest <manifest yml file>] [--verbose] [--dryrun] [--console]
```

### Options and switches
| option           | optional | default | description                                                                                                  |
|------------------|----------|---------|--------------------------------------------------------------------------------------------------------------|
| workingDirectory | true     | .       | working directory in which to search for the templates and the manifest.yml files (if not further specified) |
| --verbose        | true     | false   | increased output on "debug" level                                                                            |
| --dryrun         | true     | false   | do not write any templated files                                                                             |
| --console        | true     | false   | print the templated files to the console                                                                     |
| --manifest       | true     | ''      | location of the manifest.yml file. absolute or relative to the pwd                                           |
| --stdin          | true     | false   | reads the manifest file data from stdin. useful for usage with secrets                                       |


### File structure
For mustache template files, please refer to [the official documentation](https://mustache.github.io/mustache.5.html)  
`manifest.yml` file structure:
``` yaml
---
# list of files to be generated
files: 
    # destination file relative to the working directory
  - destination: ./foo.txt 
    # template file name. all template files must be in the working directory. 
    # *.mustache file extension is optional.
    template: my-template[.mustache] 
    # object of values to be rendered into the template
    values:
      foo: "foo"
      bar: "bar"
      fizzBuzz: 42
```

### Locating the manifest file
The `--manifest` switch of the `tmpltr` command can be used to specify the manifest file. It has highest priority and is considered to be either absolute or relative to the `pwd`.  
```
/home/
├─ some-project/
│  ├─ templates/
│  │  ├─ manifest.yml
│  │  ├─ template-a.mustache
│  │  ├─ template-b.mustache
│  ├─ README.md
│  ├─ my-manifest.yml
```
``` bash
cd /home/some-project/
tmpltr --manifest ./my-manifest.yml templates
# equivalent to
tmpltr --manifest /home/some-project/my-manifest.yml templates
```  

If no `--manifest` switch is specified, the `manifest.y[a]ml` file is searched in the working directory.
``` bash
cd /home/some-project/
tmpltr templates # uses the manifest.yml file in the templates directory
# equivalet to
cd /home/some-project/templates/
tmpltr # uses the pwd (/home/some-project/templates/) as working directory and uses the manifest.yml file
```

If no `manifest.y[a]ml` file is found, all `*.y[a]ml` files in the working directory are considered to be manifest files and checked against the YAML validator.
```
/home/
├─ some-project/
│  ├─ templates/
│  │  ├─ manifest-a.yml
│  │  ├─ manifest-b.yaml
│  │  ├─ template-a.mustache
│  │  ├─ template-b.mustache
│  ├─ README.md
│  ├─ my-manifest.yml
```
``` bash
cd /home/some-project/
tmpltr templates # uses manifest-a.yml AND manifest-b.yaml
```

### With npm/npx
``` bash
npm i -g tmpltr
# OR
npx tmpltr
```
### With docker
``` bash
docker run --rm -v ${PWD}:/usr/src mxcd/tmpltr
```
  
  
Made with &#9829;, pizza and beer by MaPa