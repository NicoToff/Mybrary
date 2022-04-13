console.log("Try loading Filepond");
FilePond.registerPlugin(FilePondPluginImagePreview, FilePondPluginImageResize, FilePondPluginFileEncode);

FilePond.parse(document.body);
console.log("Done loading Filepond");
