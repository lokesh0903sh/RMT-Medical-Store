const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { uploadGeneral, uploadDocument, deleteFromCloudinary, extractPublicId } = require('../config/cloudinary');

// Upload general files (images, documents, etc.)
router.post('/upload/general', [auth, uploadGeneral.single('file')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      message: 'File uploaded successfully',
      file: {
        url: req.file.path,
        publicId: req.file.public_id,
        originalName: req.file.originalname,
        size: req.file.bytes,
        format: req.file.format,
        resourceType: req.file.resource_type
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Failed to upload file', error: error.message });
  }
});

// Upload documents specifically (PDF, DOC, etc.)
router.post('/upload/document', [auth, uploadDocument.single('document')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No document uploaded' });
    }

    res.json({
      message: 'Document uploaded successfully',
      document: {
        url: req.file.path,
        publicId: req.file.public_id,
        originalName: req.file.originalname,
        size: req.file.bytes,
        format: req.file.format,
        resourceType: req.file.resource_type
      }
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ message: 'Failed to upload document', error: error.message });
  }
});

// Upload multiple files
router.post('/upload/multiple', [auth, uploadGeneral.array('files', 10)], async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
      url: file.path,
      publicId: file.public_id,
      originalName: file.originalname,
      size: file.bytes,
      format: file.format,
      resourceType: file.resource_type
    }));

    res.json({
      message: `${req.files.length} files uploaded successfully`,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Multiple file upload error:', error);
    res.status(500).json({ message: 'Failed to upload files', error: error.message });
  }
});

// Delete file from Cloudinary
router.delete('/delete/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ message: 'Public ID is required' });
    }

    // Decode the public ID (it might be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);
    
    const result = await deleteFromCloudinary(decodedPublicId);
    
    if (result.result === 'ok') {
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete file', result });
    }
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ message: 'Failed to delete file', error: error.message });
  }
});

// Delete file by URL
router.delete('/delete-by-url', auth, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'File URL is required' });
    }

    const publicId = extractPublicId(url);
    
    if (!publicId) {
      return res.status(400).json({ message: 'Could not extract public ID from URL' });
    }

    const result = await deleteFromCloudinary(publicId);
    
    if (result.result === 'ok') {
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete file', result });
    }
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ message: 'Failed to delete file', error: error.message });
  }
});

module.exports = router;
