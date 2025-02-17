import {
    Container, Graphics,
} from 'pixi.js';


function getGlobalScaleX(container, scaleFactor = 1){
    const {parent} = container;
    const scale = scaleFactor * (container.scale?.x ?? 1);
    if (!parent) { return scale; }

    return getGlobalScaleX(parent, scale);
}

function getGlobalScaleY(container, scaleFactor = 1) {
    const {parent} = container;
    const scale = scaleFactor * (container.scale?.y ?? 1);
    if (!parent) { return scale; }

    return getGlobalScaleY(parent, scale);
}

function getGlobalRotation(container, rotationFactor = 0) {
    const {parent} = container;
    const rotation = rotationFactor + (container.rotation ?? 0);
    if (!parent) { return rotation; }

    return getGlobalRotation(parent, rotation);
}

export class HTMLContainer extends Container {
    static app
    static isDebugMode = true
    static rootHTMLNode
    static canvas
    static instances = []

    static setDebugMode(isDebugMode = true) {
        HTMLContainer.isDebugMode = isDebugMode
        HTMLContainer.forceRevalidate()
    }

    static install(pixiApplication, config = {rootHTMLNode: null, isDebugMode: false}) {
        // запоминаем главный узел для добавления DOM элементов (по умолчанию это родитель пихи канваса)
        const rootHTMLNode = pixiApplication.view.parentElement
            || config.rootHTMLNode;

        if (!rootHTMLNode) { throw Error('You should mount PIXI Application to web page before calling install!'); }

        HTMLContainer.app = pixiApplication;
        HTMLContainer.canvas = pixiApplication.view;
        HTMLContainer.rootHTMLNode = rootHTMLNode;
        HTMLContainer.setDebugMode(config.isDebugMode);

        window.addEventListener('resize', HTMLContainer.forceRevalidate);
    }

    static uninstall() {
        const {instances, instances: {length}} = HTMLContainer;

        for (let i = 0; i < length; i++) {
            instances[0].destroy();
        }

        window.removeEventListener('resize', HTMLContainer.forceRevalidate);
    }

    static forceRevalidate() {
        for (const container of HTMLContainer.instances) {
            container.revalidate(true);
        }
    }

    static registerHTMLContainer(htmlContainer) {
        const {instances} = HTMLContainer

        if (instances.includes(htmlContainer)) { throw Error('Attempting to register the same HTMLContainer twice!'); }

        instances.push(htmlContainer)
    }

    static unregisterHTMLContainer(htmlContainer) {
        const {instances} = HTMLContainer;
        const index = instances.indexOf(htmlContainer);

        if (index === -1) { return; }

        instances.splice(index, 1);
    }

    debugGraphics = null
    htmlWrapper
    htmlContent = undefined
    sourceWidthInPixels
    sourceHeightInPixels
    contentAlignX = 'left'
    contentAlignY = 'top'

    /*
    Параметры контейнера предыдущего кадра.
    Перед применением css стилей к соответсвующему дом элементу,
    происходит сравнение, изменился ли какой-нибудь из ниже перечисленных
    параметров. Если изменился, то стили будут обновлены, и новые значения
    будут занесены в этот объект. Это для оптимизации, было бы затратно
    применять один и тот же стиль на каждую перерисовку..
    */
    previousFrameParametersStamp = {
        pivotX: 0,
        pivotY: 0,
        positionX: 0,
        positionY: 0,
        scaleX: 0,
        scaleY: 0,
        angle: 0,
        transparency: 0,
        isVisible: true,
        htmlContentWidth: 0,
        htmlContentHeight: 0,
    };

    constructor(sourceWidthInPixels = 0, sourceHeightInPixels = 0) {
        super();

        this.sourceWidthInPixels = sourceWidthInPixels;
        this.sourceHeightInPixels = sourceHeightInPixels;
        this.initHtmlWrapper();
        HTMLContainer.registerHTMLContainer(this);
        this.revalidate(true);
    }

    /*
    HTML обёртка, в которую можно положить любой HTML контент.
    Все трансформации, происходящие с контейнером на канвасе -
    дублируются на обёртке при помощи CSS стилей, при этом стили
    самого HTML контента остаются не тронутыми
    */
    initHtmlWrapper() {
        const wrapper = document.createElement('div');

        wrapper.setAttribute('id', 'pixiContainerHTMLWrapper');
        wrapper.setAttribute('style', `
            position:absolute;
            transform-origin: left top;
        `);

        HTMLContainer.rootHTMLNode.appendChild(wrapper);
        this.htmlWrapper = wrapper;
    }

    highlightSourceArea(color = 0x0000FF, alpha = 0.25) {
        const {
            sourceWidthInPixels,
            sourceHeightInPixels,
        } = this;

        if (!sourceWidthInPixels) { return; }
        if (!sourceHeightInPixels) { return; }

        this.debugGraphics = this.debugGraphics ?? this.addChildAt(new Graphics(), 0)
            .clear()
            .beginFill(color, alpha)
            .drawRect(0, 0, sourceWidthInPixels, sourceHeightInPixels)
            .endFill();
    }

    revalidate(forceRevalidate = false) {
        const {
            sourceWidthInPixels,
            sourceHeightInPixels,
            htmlWrapper,
            htmlContent,
            previousFrameParametersStamp,
            worldAlpha,
            worldVisible,
            contentAlignX,
            contentAlignY,
            pivot,
        } = this;

        const position = this.getGlobalPosition();
        const globalScaleX = getGlobalScaleX(this);
        const globalScaleY = getGlobalScaleY(this);
        const rotation = getGlobalRotation(this);
        const contentWidth = htmlContent ? htmlContent.clientWidth : 0;
        const contentHeight = htmlContent ? htmlContent.clientHeight : 0;

        const {
            pivotX,
            pivotY,
            positionX,
            positionY,
            scaleX,
            scaleY,
            angle,
            transparency,
            isVisible,
            htmlContentWidth,
            htmlContentHeight,
        } = previousFrameParametersStamp;

        // проверяем, есть ли видимые изменения
        const hasChanged = forceRevalidate
            || pivotX !== pivot.x
            || pivotY !== pivot.y
            || positionX !== position.x
            || positionY !== position.y
            || scaleX !== globalScaleX
            || scaleY !== globalScaleY
            || angle !== rotation
            || transparency !== worldAlpha
            || isVisible !== worldVisible
            || htmlContentWidth !== contentWidth
            || htmlContentHeight !== contentHeight;

        if (!hasChanged) { return; }

        // обновляем значения для последующей сверки
        previousFrameParametersStamp.pivotX = pivot.x;
        previousFrameParametersStamp.pivotY = pivot.y;
        previousFrameParametersStamp.positionX = position.x;
        previousFrameParametersStamp.positionY = position.y;
        previousFrameParametersStamp.scaleX = globalScaleX;
        previousFrameParametersStamp.scaleY = globalScaleY;
        previousFrameParametersStamp.angle = rotation;
        previousFrameParametersStamp.transparency = worldAlpha;
        previousFrameParametersStamp.isVisible = worldVisible;

        if (!HTMLContainer.canvas.getBoundingClientRect) {
            throw new Error('getBoundingClientRect not found');
        }
        // приходится также учесть трансформацию канваса
        const canvasBounds = HTMLContainer.canvas.getBoundingClientRect();
        const canvasBoundsHeight = canvasBounds.height;
        const canvasSourceHeight = HTMLContainer.canvas.height;
        const canvasScale = (canvasBoundsHeight / canvasSourceHeight) * HTMLContainer.app.renderer.resolution;

        // учитываем переполнение контейнера, если его размеры заданы
        const contentOverflowScale = htmlContent && sourceWidthInPixels && sourceHeightInPixels
            ? Math.min(
                sourceWidthInPixels / contentWidth,
                sourceHeightInPixels / contentHeight,
                1,
            )
            : 1;

        // учитываем стик контента
        let offsetX = 0;
        switch (contentAlignX) {
            case 'right':
                offsetX += Math.max(0, sourceWidthInPixels - contentWidth * contentOverflowScale);
                break;
            case 'center':
                offsetX += Math.max(0, (sourceWidthInPixels - contentWidth * contentOverflowScale) * 0.5);
                break;
            default:
                break;
        }

        let offsetY = 0;
        switch (contentAlignY) {
            case 'bottom':
                offsetY += Math.max(0, sourceHeightInPixels - contentHeight * contentOverflowScale);
                break;
            case 'middle':
                offsetY += Math.max(0, (sourceHeightInPixels - contentHeight * contentOverflowScale) * 0.5);
                break;
            default:
                break;
        }

        // применяем стили, аналогичные пихи
        const {style} = htmlWrapper;

        const finalScaleX = globalScaleX * canvasScale * contentOverflowScale;
        const finalScaleY = globalScaleY * canvasScale * contentOverflowScale;

        style.transform = `
          rotate(${rotation}rad)
          scaleX(${finalScaleX})
          scaleY(${finalScaleY})
          translateX(${(offsetX - pivot.x) / contentOverflowScale + position.x / finalScaleX}px)
          translateY(${(offsetY - pivot.y) / contentOverflowScale + position.y / finalScaleY}px)`;

        style.opacity = worldAlpha + '';
        style.display = worldVisible ? 'block' : 'none';
        style.left = '0px';
        style.top = '0px';

        // подсвечиваем бекграунд в дебаг моде
        if (HTMLContainer.isDebugMode) {
            this.highlightSourceArea();
        } else if (this.debugGraphics) {
            this.debugGraphics.destroy();
            this.debugGraphics = null;
        }

        return this;
    }

    render(renderer) {
        super.render(renderer);
        this.revalidate();
    }

    destroy() {
        HTMLContainer.unregisterHTMLContainer(this);
        super.destroy();
        this.htmlWrapper.remove();
        this.debugGraphics?.destroy();
    }

    setSourceSize(sourceWidthInPixels = 0, sourceHeightInPixels = 0) {
        this.sourceWidthInPixels = sourceWidthInPixels;
        this.sourceHeightInPixels = sourceHeightInPixels;
        this.revalidate(true);
    }

    setHTMLContent(htmlContent) {
        this.htmlContent?.remove();
        this.htmlContent = htmlContent;
        htmlContent && this.htmlWrapper.appendChild(htmlContent);
        this.revalidate(true);
    }

    removeHTMLContent() {
        this.setHTMLContent();
    }

    getHTMLContent() {
        return this.htmlContent;
    }

    alignHTMLContent(contentAlignX = 'left', contentAlignY = 'top') {
        this.contentAlignX = contentAlignX;
        this.contentAlignY = contentAlignY;
        this.revalidate();
    }

    getStyle() {
        return this.htmlWrapper.style;
    }
}
