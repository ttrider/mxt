# Plug-in info

Plug-ins expose the set of event handlers that allow them to participate in the compilation process.

## The process overview

MXT takes a bundle of templates for processing. As a result it produces a Javascript file containing all the components generated from the template files.

1. load all the template files

2. for each template file

    2.1. extract top level elements

    2.2. (optionally) transforms elements

    2.3. builds a map of all elements across all the template files 

3. for each template file

    3.1. parse elements into ASTs

4. for each template file

    4.1. generate Javascript code

5. output a single file containing all components

## Events

---

## beforeLoad

Called before loading all template files

**Input:**

- the list of files to load

**Output:**

- the list of files to load

**Default Implementation:**

- none

---

## load

Load template file

**Input:**

- file Path

**Output Context:**

- file content
- file DOM

**Default implementation:**

- yes

---

## afterLoad

Called after all files are loaded

**Input Context:**

- loaded templates

**Output Context:**

- loaded templates

**Default implementation:**

- none

## beforeTransform

Called before transforming an element

**Input Context:**

- loaded templates

**Output Context:**

- loaded templates

**Default implementation:**

- none

## transform

Transform the template

**Input Context:**

- template

**Output Context:**

- template

**Default implementation:**

- none

## beforeTransformStyle

Called before transforming an element

**Input Context:**

- loaded templates

**Output Context:**

- loaded templates

**Default implementation:**

- none

## transformStyle

Transform the template

**Input Context:**

- template

**Output Context:**

- template

**Default implementation:**

- none

## beforeTransformLink

Called before transforming an element

**Input Context:**

- loaded templates

**Output Context:**

- loaded templates

**Default implementation:**

- none

## transformLink

Transform the template

**Input Context:**

- template

**Output Context:**

- template

**Default implementation:**

- none

## afterTransformLink

Called before transforming an element

**Input Context:**

- loaded templates

**Output Context:**

- loaded templates

**Default implementation:**

- none

## beforeTransformScript

Called before transforming an element

**Input Context:**

- loaded templates

**Output Context:**

- loaded templates

**Default implementation:**

- none

## transformScript

Transform the template

**Input Context:**

- template

**Output Context:**

- template

**Default implementation:**

- none

## afterTransformScript

Called before transforming an element

**Input Context:**

- loaded templates

**Output Context:**

- loaded templates

**Default implementation:**

- none

## beforeTransformTemplate

Called before transforming an element

**Input Context:**

- loaded templates

**Output Context:**

- loaded templates

**Default implementation:**

- none

## transformTemplate

Transform the template

**Input Context:**

- template

**Output Context:**

- template

**Default implementation:**

- none

## afterTransformTemplate

Called after transforming an element

**Input Context:**

- loaded templates

**Output Context:**

- loaded templates

**Default implementation:**

- none

## afterTransform

Called after transforming an element

**Input Context:**

- loaded templates

**Output Context:**

- loaded templates

**Default implementation:**

- none

## beforeParseStyle

Transform the template

**Input Context:**

- template

**Output Context:**

- template

**Default implementation:**

- none

## parseStyle

Transform the template

**Input Context:**

- template

**Output Context:**

- template

**Default implementation:**

- none

## afterParseStyle

Transform the template

**Input Context:**

- template

**Output Context:**

- template

**Default implementation:**

- none

## beforeParseScript

Transform the template

**Input Context:**

- template

**Output Context:**

- template

**Default implementation:**

- none

## parseScript

Transform the template

**Input Context:**

- template

**Output Context:**

- template

**Default implementation:**

- none

## afterParseScript

Transform the template

**Input Context:**

- template

**Output Context:**

- template

**Default implementation:**

- none

## beforeParseTemplate

Transform the template

**Input Context:**

- template

**Output Context:**

- template

**Default implementation:**

- none

## parseTemplate

Transform the template

**Input Context:**

- template

**Output Context:**

- template

**Default implementation:**

- none

## afterParseTemplate

Transform the template

**Input Context:**

- template

**Output Context:**

- template

**Default implementation:**

- none

## beforeCodegen

Transform the template

**Input Context:**

- template

**Output Context:**

- template

**Default implementation:**

- none

## codegen

Transform the template

**Input Context:**

- template

**Output Context:**

- template

**Default implementation:**

- none

## afterCodegen

Transform the template

**Input Context:**

- template

**Output Context:**

- template

**Default implementation:**

- none

## beforePackage

Transform the template

**Input Context:**

- template

**Output Context:**

- template

**Default implementation:**

- none

## package

Transform the template

**Input Context:**

- template

**Output Context:**

- template

**Default implementation:**

- none

## afterPackage

Transform the template

**Input Context:**

- template

**Output Context:**

- template

**Default implementation:**

- none

## done

Transform the template

**Input Context:**

- template

**Output Context:**

- template

**Default implementation:**

- none


## other
Processing the set of template files generates the following set of 


    beforeProcess


    preTransform    // pre-transforms an element
                    // can change the type, attributes and the content
                    // for example, to handle custom HTML elements
                    // or top level elements
    preTransformStyle
                    // pre-transforms a <style> element
                    // can change attributes and the content
                    // used by the defaultStyleHandler to extract and apply variables
    preTransformLink
                    // pre-transforms a <link> element
                    // can change attributes
    preTransformScript
                    // pre-transforms <script>
                    // can change attributes and the content
    preTransformTemplate
                    // pre-transforms the <template> tag
                    // can change attributes and the content
    
    ==================
    
    transformStyle
                    // transforms a <style> element
                    // can change attributes and the content
                    // can be used by the less/sass processors
    transformScript
                    // can change attributes and the content
                    // transforms <script>
                    // can used by the typescript compler
    transformTemplate
                    // transforms the <template> tag
                    // can change attributes and the content

    ==================

    parseStyle      // converts the style element into the AST
                    
    parseScript     // converts the script element into the AST

    parseTemplate   // converts the template element into the AST

    ==================



    postParse       // AST post Processing