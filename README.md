# Submy
Submy: JQuery Validation Forms and Ajax Submit Data

# Get Started<br>

- Download Submy.min.js
- Include JQuery and Submy in your page 
- Include JQuery v2.1 or higher
- Start coding ... :)

## Submy Init

```html 
<!DOCTYPE html>
<html>
<head>
    <title>Submy - hello world</title>
</head>
<body>

<form id="login">
       <input type="text" name="username">
       <input type="password" name="pass">
       <div id="message"></div>
       <button id="loginSubmit">submit</button>
</form>

<script type="text/javascript" src="path/to/jquery.min.js"></script>
<script type="text/javascript" src="path/to/Submy.min.js"></script>
<script type="text/javascript">
    // $(selector).submy({ options });

    $('#login').submy({
        submitId: '#loginSubmit', // btn submit id
        messageId: '#message', // respond message id
    }); 
</script>    
</body>
</html>
```

## Create Your Rules
There are two ways to write your own rules, either by `data-submy=' JSON Format '` in input or in the `options` object by `rules` , you can combine two, provided that there is no conflict of inputs names

### Start Example
```html
<form id="startExpl">

       <input name="full-name" data-submy='{"required": true, "type": "text", "min": 4, "max": 30}'>
       <input name="user-name" data-submy='{"required": "please add your username", "type": "username", "min": 4, "max": 10, "typeMesasge": "please add a valid username"}'>
       <input name="user-email" data-submy='{"required": "please add your email", "type": "email", "typeMessage": "please add valid email"}'>
       
       <!-- required false -->
       <select name="ctry">  
           <option value="uk">UK</option>
           <option value="us">USA</option>
       </select>

       <input id="password" name="user-pass" data-submy='{"required": true, "type": "password"}'>

       <input name="conf-pass" data-submy='{"required": true, "type": "password", "is": ["equal", "#password"], "showError": ["after": "#notPassMessage"]}'>

       <div id="notPassMessage"></div>

       <div id="message"></div>

       <button id="loginSubmit">submit</button>
</form>

<script type="text/javascript">
    
    $('#startExpl').submy({
        submitId: '#loginSubmit', 
        messageId: '#message',
        ajax: {
            url: 'http://site.com/sub.php',
            method: 'POST',
            //....
        },
        done: function(text, st, ob) {

            alert('done');
            console.log(text, st, ob);
        }
    }); 
</script>  
```

### Full Example

```html
<form id="ex2">

       <input name="fullname"> <!--See Rules -->
       <input name="user-name" data-submy='{"required": "please add your username", "type": "username", "min": 4, "max": 10, "typeMesasge": "please add a valid username"}'>


       <input name="useremail">
       
       <!-- required false -->
       <select name="ctry">  
           <option value="uk">UK</option>
           <option value="us">USA</option>
       </select>

       <textarea name="text-area" data-submy='{"required": true, "max": 500, "maxMessage": "maximum text is {{max}} chars"}'></textarea>

       <input id="password" name="user-pass" data-submy='{"required": true, "type": "password"}'>

       <input name="conf-pass" data-submy='{"required": true, "type": "password", "is": ["equal", "#password"], "showError": ["after", "#notPassMessage"]}'>

       <div id="notPassMessage"></div>

       <input name="thisFile" data-submy='{"type": "file", "typeMessage": "please add your image", "minSize": 30, "minSizeMessage": "min file size is {{min}}", "maxSize": 500000}'>

       <div id="message"></div>

       <button id="loginSubmit">submit</button>
</form>

<script type="text/javascript" src="jquery.min.js"></script>
<script type="text/javascript" src="Submy.min.js"></script>
<script type="text/javascript">
    
    $('#ex2').submy({
        submitId: '#loginSubmit', 
        messageId: '#message',
        fileUpload: true,
        rules: {
            fullname: {
                required: true, 
                type: "text", 
                min: 4, 
                max: 30
            },
            useremail: {
                required: "please add your email", 
                type: "email", 
                typeMessage: "please add valid email"
            }
        },
        ajax: {
            url: 'http://site.com/submit.php',
            //method: 'POST', ajax default method is POST
            //....
        },
    }); 
</script>  
```

#### submit.php
```php
<?php

print_r($_FILES);
print_r($_POST);

```
#### submit.php example 2
```php
<?php

$res = new \stdClass;

$res->type = 'danger'; // info , success ...
$res->message = 'email not exists';

echo json_encode($res);

```

#### submit.php example 3
```php
<?php

// echo '<script>alert("hi");</script>';
echo '<div> test </div>';

```

## Submy Options


| Option     | Type              | Default      | Description                                                                                         |
|------------|-------------------|--------------|-----------------------------------------------------------------------------------------------------|
| `submitId`   | string            | #submit      | form submit btn id                                                                                  |
| `messageId`  | string            | #formMessage | form message id                                                                                     |
| `validOn`    | string            | submit       | valid form on `submit` btn click or form `change`                                                       |
| `rules`      | object            | {}           | inputs rules                                                                                        |
| `fileUpload` | boolean           | false        | file upload in form                                                                                 |
| `charset`    | string            | UTF-8        | form charset                                                                                        |
| `errConsole` | boolean           | true         | show submy error, warn , log                                                                        |
| `showError`  | array             | []           | default show input error : [] after input , `['before', '#test']`, `['after', '#test']`, `['in', 'test']` |
| `jsonDone`   | callback function | false        | submy json done function                                                                            |
| `done`       | callback function | false        | ajax done                                                                                           |

## Submy Rules Options
| Options         | Types              | Default                                                                                   | Description                                                                                                                                                          |
|----------------|-------------------|-------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `required`       | boolean or string | false , if true defualt is : this field is required , if type = file : please choose file | input/select/textarea/input file are required ?                                                                                                                      |
| `type`           | string            | input type attr                                                                           | input content types : `file` , `text` , `email`, `url`, `number`, `username`, `checkbox`, `radio` .  for validation (date types now not supported , next update Inchaallah  in v1.2) |
| `typeMessage`    | string            | this field is not valid                                                                   | type option error message                                                                                                                                            |
| `min`            | number            |                                                                                           | minimum number if type = number , minimum length if type = text                                                                                                      |
| `minMessage`     | string            | minimum length is: {{min}} | minimum number is: {{min}}                                   | min option error message                                                                                                                                             |
| `max`           | number            | maximum length is: {{max}} | maximum number is: {{max}}                                   | maximum number if type = number , maximum length if type = text                                                                                                      |
|  `is`             | array             | []                                                                                        | run submyIsFunctions : `["equal", "#xInput"]` : check this input value is === #xInput input value                                                                      |
| `isEqual`        | string            | error in this field                                                                       | is equal error message                                                                                                                                               |
| `types`          | array             | ['*/*']                                                                                   | determine file mime types  ex : `['image/png', 'image/jpeg', 'image/gif']`                                                                                             |
| `typesMessage`   | string            | file type is not allowed                                                                  | types options error message                                                                                                                                          |
| `minSize`        | number            |                                                                                           | file minimum size by bytes                                                                                                                                           |
| `minSizeMessage` | string            | minimum file size is: {{min}}                                                             | minSize error message                                                                                                                                                |
| `maxSize`        | number            |                                                                                           | max file size by bytes                                                                                                                                               |
| `maxSizeMessage` | string            | maximum file size is: {{max}}                                                             | maxSize error message                                                                                                                                                |


full documentation is comming
