module doc.txt {
    requires doc.core;
    provides doc.core.DocumentProcessor with doc.txt.PlainTextProcessor;
}
