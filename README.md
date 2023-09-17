![](https://badgen.net/badge/editorjs-image-tool-delete/v0.0.2/blue)

# Editorjs Image Tool with Delete Module

Editorjs Image Block with Delete Module for the [Editor.js](https://editorjs.io).

This is the forked repository of ![Image Block for the Editor.js](https://github.com/editor-js/image) with delete module to allow deleting image when the block is removed. We highly recommend you to check out the docs from ![Image Block for the Editor.js](https://github.com/editor-js/image) first.

![](https://capella.pics/63a03d04-3816-45b2-87b2-d85e556f0066.jpg)

## Features

- Uploading file from the device
- Pasting copied content from the web
- Pasting images by drag-n-drop
- Pasting files and screenshots from Clipboard
- Allows adding a border, and a background
- Allows stretching an image to the container's full-width

**Notes**

This Tool requires server-side implementation for the file uploading. See [backend response format](#server-format) for more details.

This Tool is also capable of uploading & displaying video files using the <video> element. To enable this, specify video mime-types via the 'types' config param.

## Installation

### Install via NPM

Get the package

```shell
npm i --save-dev @pawritharya/editorjs-image-tool-delete
```

Include module at your application

```javascript
import ImageTool from '@pawritharya/editorjs-image-tool-delete';
```

## Usage

Add a new Tool to the `tools` property of the Editor.js initial config.

```javascript
import ImageTool from '@editorjs/image';


var editor = EditorJS({
  ...

  tools: {
    ...
    image: {
      class: ImageTool,
      config: {
      uploader: {
        uploadByFile: async file => {
          const { data } = await uploadFile({ variables: { file } });

          return {
            success: 1,
            file: {
              url: data.fileUpload.uploadedFile.url
            }
          };
        }
      },
      deleter: {
        deleteFile: async url => {
          const { data } = await deleteFile({ variables: { url } });

          return { success: 1 };
        }
      }
    }
    }
  }

  ...
});
```

## Config Params

Image Tool supports these configuration parameters:

| Field                    | Type                                                | Description                                                                                                                                                                             |
| ------------------------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| endpoints                | `{byFile: string, byUrl: string}`                   | Endpoints for file uploading. <br> Contains 2 fields: <br> **byFile** - for file uploading <br> **byUrl** - for uploading by URL                                                        |
| field                    | `string`                                            | (default: `image`) Name of uploaded image field in POST request                                                                                                                         |
| types                    | `string`                                            | (default: `image/*`) Mime-types of files that can be [accepted with file selection](https://github.com/codex-team/ajax#accept-string).                                                  |
| additionalRequestData    | `object`                                            | Object with any data you want to send with uploading requests                                                                                                                           |
| additionalRequestHeaders | `object`                                            | Object with any custom headers which will be added to request. [See example](https://github.com/codex-team/ajax/blob/e5bc2a2391a18574c88b7ecd6508c29974c3e27f/README.md#headers-object) |
| captionPlaceholder       | `string`                                            | (default: `Caption`) Placeholder for Caption input                                                                                                                                      |
| buttonContent            | `string`                                            | Allows to override HTML content of «Select file» button                                                                                                                                 |
| uploader                 | `{{uploadByFile: function, uploadByUrl: function}}` | Optional custom uploading methods. See details below.                                                                                                                                   |
| deleter                  | `{{deleteFile: function}}`                          | Optional custom deleting methods. See details below.                                                                                                                                    |
| actions                  | `array`                                             | Array with custom actions to show in the tool's settings menu. See details below.                                                                                                       |

Note that if you don't implement your custom uploader methods, the `endpoints` param is required.

## Providing custom deleting method

As mentioned at the Config Params section, you have an ability to provide own custom deleting method.
It is a quite simple: implement `deleteFile` method and pass them via `deleter` config param.
The method must return a Promise that resolves with response in a format that described at the [backend response format](#server-format) section.

| Method     | Arguments | Return value            | Description                                                   |
| ---------- | --------- | ----------------------- | ------------------------------------------------------------- |
| deleteFile | `String`  | `{Promise.<{success}>}` | Delete file with provided url when the image block is removed |

Example:

```js
import ImageTool from '@pawritharya/editorjs-image-tool-delete';

var editor = EditorJS({
  ...

  tools: {
    ...
    image: {
      class: ImageTool,
      config: {
      deleter: {
        deleteFile: async url => {
          const { data } = await deleteFile({ variables: { url } });

          return { success: 1 };
        }
      }
    }
    }
  }

  ...
});
```
