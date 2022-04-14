// Doc : https://pqina.nl/filepond/docs/

try {
    console.log("Try loading Filepond");
    FilePond.registerPlugin(FilePondPluginImagePreview, FilePondPluginImageResize, FilePondPluginFileEncode);
    FilePond.setOptions({
        // Panel size on webpage
        stylePanelAspectRatio: 150 / 100,
        // Sets max size for saving image
        imageResizeTargetWidth: 100,
        imageResizeTargetHeight: 150,
    });
    FilePond.parse(document.body);
    console.log("Done loading Filepond");
} catch (error) {
    console.error(error);
}
