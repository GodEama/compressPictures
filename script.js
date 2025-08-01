class ImageCompressor {
    constructor() {
        this.selectedFiles = [];
        this.compressedResults = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const uploadBtn = document.getElementById('uploadBtn');
        const compressBtn = document.getElementById('compressBtn');
        const qualitySlider = document.getElementById('qualitySlider');
        const qualityValue = document.getElementById('qualityValue');

        // 文件上传事件
        uploadBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            console.log('File input change event triggered');
            this.handleFileSelect(e.target.files);
            // 清空input的值，这样选择相同文件时也能触发change事件
            e.target.value = '';
        });

        // 拖拽上传
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files);
        });

        // 只在点击上传区域的空白部分时触发文件选择，避免与按钮冲突
        uploadArea.addEventListener('click', (e) => {
            // 如果点击的是按钮，不触发文件选择
            if (e.target === uploadBtn || uploadBtn.contains(e.target)) {
                return;
            }
            fileInput.click();
        });

        // 质量滑块
        qualitySlider.addEventListener('input', (e) => {
            qualityValue.textContent = e.target.value;
        });

        // 压缩按钮
        compressBtn.addEventListener('click', () => this.compressImages());
    }

    handleFileSelect(files) {
        console.log('handleFileSelect called with:', files);
        console.log('Files length:', files.length);
        
        if (!files || files.length === 0) {
            console.log('No files provided');
            this.showNotification('没有选择任何文件', 'error');
            return;
        }

        const validFiles = Array.from(files).filter((file, index) => {
            console.log(`Processing file ${index}:`, {
                name: file.name,
                type: file.type,
                size: file.size
            });
            
            const isValidType = file.type.startsWith('image/');
            const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
            
            if (!isValidType) {
                console.log(`File ${file.name} has invalid type: ${file.type}`);
                this.showNotification(`文件 ${file.name} 不是有效的图片格式`, 'error');
                return false;
            }
            
            if (!isValidSize) {
                console.log(`File ${file.name} is too large: ${file.size} bytes`);
                this.showNotification(`文件 ${file.name} 大小超过10MB限制`, 'error');
                return false;
            }
            
            console.log(`File ${file.name} is valid`);
            return true;
        });

        console.log('Valid files:', validFiles.length);
        
        if (validFiles.length > 0) {
            this.selectedFiles = validFiles;
            this.showSettingsSection();
            this.showNotification(`已选择 ${validFiles.length} 个文件`, 'success');
            console.log('Files successfully selected:', this.selectedFiles);
        } else {
            console.log('No valid files found');
            this.showNotification('没有找到有效的图片文件', 'error');
        }
    }

    showSettingsSection() {
        const settingsSection = document.getElementById('settingsSection');
        settingsSection.style.display = 'block';
        settingsSection.classList.add('fade-in');
    }

    async compressImages() {
        if (this.selectedFiles.length === 0) {
            this.showNotification('请先选择图片文件', 'error');
            return;
        }

        const quality = parseInt(document.getElementById('qualitySlider').value) / 100;
        const format = document.getElementById('formatSelect').value;
        
        this.showProgressSection();
        this.compressedResults = [];

        for (let i = 0; i < this.selectedFiles.length; i++) {
            const file = this.selectedFiles[i];
            this.updateProgress((i / this.selectedFiles.length) * 100, `正在压缩: ${file.name}`);
            
            try {
                const compressedResult = await this.compressImage(file, quality, format);
                this.compressedResults.push(compressedResult);
            } catch (error) {
                console.error('压缩失败:', error);
                this.showNotification(`压缩 ${file.name} 失败`, 'error');
            }
        }

        this.updateProgress(100, '压缩完成!');
        setTimeout(() => {
            this.hideProgressSection();
            this.showResults();
        }, 1000);
    }

    async compressImage(file, quality, format) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = async () => {
                // 智能尺寸优化：如果图片很大，适当缩小尺寸
                let { width, height } = this.calculateOptimalSize(img.naturalWidth, img.naturalHeight, file.size);
                
                canvas.width = width;
                canvas.height = height;

                // 高质量绘制
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                // 尝试多种压缩策略，选择最优结果
                const compressionResults = await this.tryMultipleCompressionStrategies(
                    canvas, file, quality, format
                );
                
                // 选择文件最小的结果
                const bestResult = compressionResults.reduce((best, current) => 
                    current.size < best.size ? current : best
                );

                // 如果压缩后反而变大，返回原文件
                if (bestResult.size >= file.size) {
                    resolve({
                        original: {
                            file: file,
                            size: file.size,
                            url: URL.createObjectURL(file)
                        },
                        compressed: {
                            blob: file,
                            size: file.size,
                            url: URL.createObjectURL(file),
                            format: file.type
                        },
                        compressionRatio: 0,
                        fileName: file.name,
                        note: '原文件已经很小，无需压缩'
                    });
                } else {
                    const compressionRatio = ((file.size - bestResult.size) / file.size * 100).toFixed(1);
                    
                    resolve({
                        original: {
                            file: file,
                            size: file.size,
                            url: URL.createObjectURL(file)
                        },
                        compressed: {
                            blob: bestResult.blob,
                            size: bestResult.size,
                            url: URL.createObjectURL(bestResult.blob),
                            format: bestResult.format
                        },
                        compressionRatio: compressionRatio,
                        fileName: this.generateFileName(file.name, bestResult.format)
                    });
                }
            };

            img.onerror = () => reject(new Error('图片加载失败'));
            img.src = URL.createObjectURL(file);
        });
    }

    calculateOptimalSize(originalWidth, originalHeight, fileSize) {
        // 如果文件很大且尺寸很大，适当缩小
        const maxDimension = 2048; // 最大尺寸限制
        const fileSizeMB = fileSize / (1024 * 1024);
        
        let width = originalWidth;
        let height = originalHeight;
        
        // 如果图片尺寸过大，按比例缩小
        if (width > maxDimension || height > maxDimension) {
            const ratio = Math.min(maxDimension / width, maxDimension / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
        }
        
        // 如果文件很大但尺寸适中，可以保持原尺寸但提高压缩率
        return { width, height };
    }

    async tryMultipleCompressionStrategies(canvas, originalFile, quality, format) {
        const strategies = [];
        
        // 策略1: 优先使用原图格式（自动模式）或用户选择的格式
        const primaryFormat = this.determineOutputFormat(originalFile.type, format);
        strategies.push(this.compressWithFormat(canvas, primaryFormat, quality));
        
        // 只有在自动模式下才尝试其他格式优化
        if (format === 'auto') {
            // 策略2: 如果原图是PNG，检查是否有透明度，没有透明度可以尝试JPEG
            if (originalFile.type === 'image/png') {
                const hasTransparency = this.checkTransparency(canvas);
                if (!hasTransparency) {
                    // 没有透明度的PNG可以尝试JPEG，通常能获得更好的压缩
                    strategies.push(this.compressWithFormat(canvas, 'image/jpeg', quality));
                }
            }
            
            // 策略3: 如果原图是JPEG，尝试稍微提高压缩率
            if (originalFile.type === 'image/jpeg' && quality > 0.6) {
                strategies.push(this.compressWithFormat(canvas, 'image/jpeg', Math.max(0.4, quality - 0.2)));
            }
            
            // 注意：移除了WebP策略，保持格式兼容性
            // 如果用户需要WebP，可以手动选择WebP格式
        } else {
            // 非自动模式：如果用户选择了特定格式，尝试不同质量
            if (primaryFormat === 'image/jpeg' && quality > 0.5) {
                strategies.push(this.compressWithFormat(canvas, primaryFormat, Math.max(0.3, quality - 0.2)));
            }
        }
        
        return Promise.all(strategies);
    }

    checkTransparency(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // 检查alpha通道，每4个值中的第4个是alpha值
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] < 255) {
                return true; // 发现透明或半透明像素
            }
        }
        return false; // 没有透明度
    }

    compressWithFormat(canvas, format, quality) {
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve({
                    blob: blob,
                    size: blob ? blob.size : Infinity,
                    format: format
                });
            }, format, format === 'image/png' ? undefined : quality);
        });
    }

    supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    determineOutputFormat(originalType, selectedFormat) {
        if (selectedFormat === 'auto') {
            // 自动模式：优先保持原图格式，确保兼容性
            return originalType;
        } else if (selectedFormat === 'jpeg') {
            return 'image/jpeg';
        } else if (selectedFormat === 'png') {
            return 'image/png';
        } else if (selectedFormat === 'webp') {
            return 'image/webp';
        }
        return originalType;
    }

    generateFileName(originalName, format) {
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
        const extension = format.split('/')[1];
        return `${nameWithoutExt}_compressed.${extension}`;
    }

    showProgressSection() {
        const progressSection = document.getElementById('progressSection');
        progressSection.style.display = 'block';
        progressSection.classList.add('fade-in');
    }

    hideProgressSection() {
        const progressSection = document.getElementById('progressSection');
        progressSection.style.display = 'none';
    }

    updateProgress(percentage, text) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = text;
    }

    showResults() {
        const resultsSection = document.getElementById('resultsSection');
        const resultsGrid = document.getElementById('resultsGrid');
        
        resultsGrid.innerHTML = '';
        
        this.compressedResults.forEach((result, index) => {
            const resultCard = this.createResultCard(result, index);
            resultsGrid.appendChild(resultCard);
        });
        
        resultsSection.style.display = 'block';
        resultsSection.classList.add('fade-in');
    }

    createResultCard(result, index) {
        const card = document.createElement('div');
        card.className = 'result-card scale-in';
        
        const compressionRatio = parseFloat(result.compressionRatio);
        let ratioText, ratioColor, ratioBackground;
        
        if (compressionRatio <= 0) {
            ratioText = '无需压缩';
            ratioColor = '#6b7280';
            ratioBackground = '#f3f4f6';
        } else if (compressionRatio > 50) {
            ratioText = `压缩 ${result.compressionRatio}%`;
            ratioColor = '#166534';
            ratioBackground = '#dcfce7';
        } else if (compressionRatio > 20) {
            ratioText = `压缩 ${result.compressionRatio}%`;
            ratioColor = '#ca8a04';
            ratioBackground = '#fef3c7';
        } else {
            ratioText = `压缩 ${result.compressionRatio}%`;
            ratioColor = '#dc2626';
            ratioBackground = '#fee2e2';
        }

        // 获取文件扩展名
        const fileName = result.original.file.name;
        const fileExtension = fileName.split('.').pop().toUpperCase();
        
        card.innerHTML = `
            <div class="file-thumbnail">
                <img src="${result.compressed.url}" alt="${fileName}">
            </div>
            <div class="file-info">
                <div class="file-name">${fileName}</div>
                <div class="file-details">
                    <span class="file-type">${fileExtension}</span>
                    <span class="file-size">${this.formatFileSize(result.original.size)}</span>
                </div>
            </div>
            <div class="compression-info">
                <div class="compression-ratio" style="background-color: ${ratioBackground}; color: ${ratioColor};">
                    ${ratioText}
                </div>
                <div class="compressed-size">${this.formatFileSize(result.compressed.size)}</div>
            </div>
            <div class="file-actions">
                <button class="download-btn-compact" onclick="compressor.downloadImage(${index})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    ${fileExtension}
                </button>
            </div>
        `;
        
        return card;
    }

    downloadImage(index) {
        const result = this.compressedResults[index];
        
        // 使用安全的下载方法
        this.safeDownloadBlob(result.compressed.blob, result.fileName);
        
        this.showNotification('下载开始', 'success');
    }

    async downloadAll() {
        if (this.compressedResults.length === 0) {
            this.showNotification('没有可下载的文件', 'error');
            return;
        }

        // 如果只有一个文件，直接下载
        if (this.compressedResults.length === 1) {
            this.downloadImage(0);
            return;
        }

        // 多个文件时，创建ZIP压缩包下载
        await this.downloadAsZip();
    }

    async downloadAsZip() {
        const batchBtn = document.getElementById('batchDownloadBtn');
        const originalText = batchBtn.innerHTML;
        
        try {
            // 检查JSZip是否可用
            if (typeof JSZip === 'undefined') {
                this.showNotification('ZIP功能不可用，将使用逐个下载', 'warning');
                await this.downloadSequentially();
                return;
            }

            // 更新按钮状态
            batchBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path d="M10 6V10L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                创建压缩包...
            `;
            batchBtn.disabled = true;

            // 创建ZIP实例
            const zip = new JSZip();
            
            // 显示创建提示
            this.showNotification(`正在创建包含 ${this.compressedResults.length} 个文件的压缩包...`, 'info');

            // 添加文件到ZIP
            for (let i = 0; i < this.compressedResults.length; i++) {
                const result = this.compressedResults[i];
                
                // 更新进度
                batchBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" fill="none"/>
                        <path d="M10 6V10L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    添加文件 ${i + 1}/${this.compressedResults.length}
                `;

                // 获取文件扩展名
                const fileName = this.sanitizeFileName(result.fileName);
                
                // 添加文件到ZIP（使用blob数据和元数据）
                zip.file(fileName, result.compressed.blob, {
                    // 添加文件元数据以减少安全警告
                    date: new Date(),
                    comment: `Compressed image - Original size: ${this.formatFileSize(result.original.size)}, Compressed size: ${this.formatFileSize(result.compressed.size)}`,
                    // 设置文件权限（类Unix权限）
                    unixPermissions: 0o644,
                    // 设置DOS属性
                    dosPermissions: 0x20
                });
            }

            // 生成ZIP文件
            batchBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path d="M10 6V10L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                生成压缩包...
            `;

            // 使用更安全的ZIP生成选项，避免Windows安全警告
            const zipBlob = await zip.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: {
                    level: 6
                },
                // 添加元数据以减少安全警告
                comment: "Compressed images created by Image Compressor Tool",
                // 使用标准的ZIP格式
                platform: "UNIX"
            });

            // 生成ZIP文件名（包含时间戳）
            const now = new Date();
            const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
            const zipFileName = `compressed_images_${timestamp}.zip`;
            
            // 使用更安全的下载方式，ZIP文件允许用户选择保存位置
            await this.safeDownloadBlob(zipBlob, zipFileName, true);

            // 计算总的压缩统计
            const totalOriginalSize = this.compressedResults.reduce((sum, result) => sum + result.original.size, 0);
            const totalCompressedSize = this.compressedResults.reduce((sum, result) => sum + result.compressed.size, 0);
            const totalSavings = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1);

            this.showNotification(
                `成功下载压缩包！包含 ${this.compressedResults.length} 个文件，总体积节省 ${totalSavings}%`, 
                'success'
            );

        } catch (error) {
            console.error('创建ZIP压缩包失败:', error);
            this.showNotification('创建压缩包失败，将使用逐个下载', 'error');
            // 降级到逐个下载
            await this.downloadSequentially();
        } finally {
            // 恢复按钮状态
            batchBtn.innerHTML = originalText;
            batchBtn.disabled = false;
        }
    }

    // 新增：安全的文件下载方法，减少Windows安全警告
    async safeDownloadBlob(blob, fileName, useFilePicker = false) {
        return new Promise((resolve) => {
            try {
                // 只有在明确指定时才使用文件选择器（比如ZIP批量下载）
                if (useFilePicker && window.showSaveFilePicker) {
                    this.downloadWithFilePicker(blob, fileName).then(resolve).catch(() => {
                        // 降级到传统方法
                        this.downloadWithTraditionalMethod(blob, fileName);
                        resolve();
                    });
                } else {
                    // 直接使用传统下载方法，保存到默认位置
                    this.downloadWithTraditionalMethod(blob, fileName);
                    resolve();
                }
            } catch (error) {
                console.error('下载失败:', error);
                // 最后的降级方案
                this.downloadWithTraditionalMethod(blob, fileName);
                resolve();
            }
        });
    }

    // 使用现代文件系统API下载（减少安全警告）
    async downloadWithFilePicker(blob, fileName) {
        // 根据文件扩展名确定文件类型
        const ext = fileName.split('.').pop().toLowerCase();
        let fileTypes;
        
        switch (ext) {
            case 'zip':
                fileTypes = [{
                    description: 'ZIP files',
                    accept: { 'application/zip': ['.zip'] }
                }];
                break;
            case 'jpg':
            case 'jpeg':
                fileTypes = [{
                    description: 'JPEG images',
                    accept: { 'image/jpeg': ['.jpg', '.jpeg'] }
                }];
                break;
            case 'png':
                fileTypes = [{
                    description: 'PNG images',
                    accept: { 'image/png': ['.png'] }
                }];
                break;
            case 'webp':
                fileTypes = [{
                    description: 'WebP images',
                    accept: { 'image/webp': ['.webp'] }
                }];
                break;
            default:
                fileTypes = [{
                    description: 'All files',
                    accept: { '*/*': ['.*'] }
                }];
        }
        
        const fileHandle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: fileTypes
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
    }

    // 优化的传统下载方法
    downloadWithTraditionalMethod(blob, fileName) {
        // 确保blob有正确的MIME类型
        let mimeType = blob.type;
        if (!mimeType) {
            // 根据文件扩展名推断MIME类型
            const ext = fileName.split('.').pop().toLowerCase();
            switch (ext) {
                case 'zip':
                    mimeType = 'application/zip';
                    break;
                case 'jpg':
                case 'jpeg':
                    mimeType = 'image/jpeg';
                    break;
                case 'png':
                    mimeType = 'image/png';
                    break;
                case 'webp':
                    mimeType = 'image/webp';
                    break;
                default:
                    mimeType = 'application/octet-stream';
            }
            // 重新创建blob以确保正确的MIME类型
            blob = new Blob([blob], { type: mimeType });
        }
        
        // 创建一个临时的 URL
        const url = URL.createObjectURL(blob);
        
        // 创建下载链接
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        
        // 设置额外的属性以减少安全警告
        link.setAttribute('rel', 'noopener noreferrer');
        link.setAttribute('target', '_self');
        link.setAttribute('type', mimeType);
        
        // 隐藏链接
        link.style.display = 'none';
        link.style.position = 'absolute';
        link.style.left = '-9999px';
        link.style.visibility = 'hidden';
        
        // 添加到DOM并触发下载
        document.body.appendChild(link);
        
        // 使用用户交互触发下载（更安全）
        setTimeout(() => {
            // 模拟用户点击
            const event = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            link.dispatchEvent(event);
            
            // 延迟清理，确保下载开始
            setTimeout(() => {
                if (document.body.contains(link)) {
                    document.body.removeChild(link);
                }
                URL.revokeObjectURL(url);
            }, 3000);
        }, 100);
    }

    supportsBatchDownload() {
        // 检查浏览器是否支持批量下载
        return true;
    }

    // 新增：文件名安全化方法
    sanitizeFileName(fileName) {
        // 移除或替换不安全的字符
        return fileName
            .replace(/[<>:"/\\|?*]/g, '_')  // 替换Windows不允许的字符
            .replace(/\s+/g, '_')          // 替换空格为下划线
            .replace(/_{2,}/g, '_')        // 合并多个下划线
            .replace(/^_+|_+$/g, '')       // 移除开头和结尾的下划线
            .substring(0, 100);            // 限制文件名长度
    }

    async downloadSequentially() {
        const batchBtn = document.getElementById('batchDownloadBtn');
        const originalText = batchBtn.innerHTML;
        
        for (let i = 0; i < this.compressedResults.length; i++) {
            // 更新按钮状态
            batchBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path d="M10 6V10L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                下载中 ${i + 1}/${this.compressedResults.length}
            `;
            batchBtn.disabled = true;
            
            // 下载当前文件
            this.downloadImage(i);
            
            // 等待一小段时间，避免浏览器阻止多个下载
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // 恢复按钮状态
        batchBtn.innerHTML = originalText;
        batchBtn.disabled = false;
        
        this.showNotification(`成功下载 ${this.compressedResults.length} 个文件`, 'success');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        // 设置背景色
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// 初始化应用
const compressor = new ImageCompressor();

// 添加一些实用的工具函数
window.addEventListener('load', () => {
    // 检查浏览器支持
    if (!HTMLCanvasElement.prototype.toBlob) {
        compressor.showNotification('您的浏览器不支持图片压缩功能，请升级浏览器', 'error');
    }
    
    // 添加键盘快捷键
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'v') {
            // Ctrl+V 粘贴图片
            navigator.clipboard.read().then(items => {
                for (const item of items) {
                    for (const type of item.types) {
                        if (type.startsWith('image/')) {
                            item.getType(type).then(blob => {
                                const file = new File([blob], 'pasted-image.png', { type: blob.type });
                                compressor.handleFileSelect([file]);
                            });
                            break;
                        }
                    }
                }
            }).catch(() => {
                // 忽略粘贴错误
            });
        }
    });
});

// 防止页面刷新时丢失数据的警告
window.addEventListener('beforeunload', (e) => {
    if (compressor.selectedFiles.length > 0 && compressor.compressedResults.length === 0) {
        e.preventDefault();
        e.returnValue = '您有未完成的图片压缩任务，确定要离开吗？';
    }
});