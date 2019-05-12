'use strict';

function Facehuggers() {
    this.LINK = 1;
    this.BACK_BUTTON = 2;

    this.request = new XMLHttpRequest();
    this.type = this.LINK;
    this.element = null;

    this.request.onreadystatechange = () => {
        if (this.request.readyState !== XMLHttpRequest.DONE) {
            return;
        }

        const newDocument = this.request.responseXML === null
            ? (new DOMParser()).parseFromString(this.request.response, 'text/html')
            : this.request.responseXML;
        const title = newDocument.getElementsByTagName('title');

        history.pushState(
            null,
            typeof title.text === 'undefined' ? null : title.text,
            this.request.responseURL
        );

        document.dispatchEvent(
            new CustomEvent(
                'FacehuggersNewDocumentLoadEnd',
                {
                    detail: {
                        document: newDocument,
                        element: this.element,
                        type: this.type
                    }
                }
            )
        );
    };

    this.implant();
}

Facehuggers.prototype.getURLParts = function (url) {
    const urlParts = url.match(
        /(?:(?:https?:)?\/\/((?:[a-z0-9-]+\.)*(?:[a-z0-9-]+)(?:\.[a-z0-9-]{2,}))?)?(.*)/
    );

    return {
        hostname: urlParts[1] === undefined ? null : urlParts[1],
        pathname: urlParts[2] === undefined ? null : urlParts[2]
    };
};

Facehuggers.prototype.getElementParentLink = function (element) {
    while (element.parentNode) {
        console.log(element.parentNode);
        const parentNode = element.parentNode;

        if (parentNode.tagName === 'A') {
            return parentNode;
        }

        element = parentNode;
    }

    return null;
};

Facehuggers.prototype.get = function (url) {
    this.request.open('GET', url, true);
    this.request.send(null);

    document.dispatchEvent(
        new CustomEvent('FacehuggersNewDocumentLoadStart')
    );
};

Facehuggers.prototype.implant = function () {
    const hostname = this.getURLParts(document.URL).hostname;

    window.addEventListener(
        'click',
        event => {
            const element = event.target;

            let link = null;

            if (element.tagName !== 'A') {
                const parentLink = this.getElementParentLink(element);

                if (parentLink === null) {
                    return;
                }

                link = parentLink;
            } else {
                link = element;
            }

            const href = link.getAttribute('href');

            if (
                href === null
                || this.getURLParts(href).hostname !== hostname
            ) {
                return;
            }

            event.preventDefault();

            this.type = this.LINK;
            this.element = link;

            this.get(href)
        },
        true
    );

    window.onpopstate = () => {
        this.type = this.BACK_BUTTON;
        this.element = null;

        this.get(document.location.href);
    };
};

module.exports = Facehuggers;
