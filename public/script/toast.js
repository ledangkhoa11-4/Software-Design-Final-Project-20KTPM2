const arrTimeOut = [];
const arrEleStart = [];
function closeToast(t){
    const idx = arrEleStart.indexOf(t.parentElement);
    if (idx >=0){
        arrTimeOut.splice(idx,1);
        arrEleStart.splice(idx,1);
    }
    t.parentElement.remove();
}
function addSuccess(content){
    const divIcon = document.createElement("div");
    divIcon.classList.add("my-toast__icon")
    divIcon.classList.add("my-toast__icon--success")
    const iIcon = document.createElement("i");
    iIcon.classList.add("fa");
    iIcon.classList.add("fa-thin");
    iIcon.classList.add("fa-circle-check");
    divIcon.appendChild(iIcon);

    const divBody = document.createElement("div");
    divBody.classList.add("my-toast__body");
    const h3 = document.createElement("h3");
    h3.classList.add("my-toast__status");
    const textStatus = document.createTextNode("Success");
    h3.appendChild(textStatus);
    const p = document.createElement("p");
    p.classList.add("my-toast__msg");
    const textMsg = document.createTextNode(content);
    p.appendChild(textMsg);
    divBody.appendChild(h3);
    divBody.appendChild(p);

    const divClose = document.createElement("div");
    divClose.classList.add("my-toast__close");
    divClose.setAttribute("onclick","closeToast(this);");
    const iClose = document.createElement("i");
    iClose.classList.add("fa");
    iClose.classList.add("fa-light");
    iClose.classList.add("fa-xmark");
    divClose.appendChild(iClose);

    const divParent = document.createElement("div");
    divParent.classList.add("my-toast");
    divParent.classList.add("my-toast--success");
    divParent.appendChild(divIcon);
    divParent.appendChild(divBody);
    divParent.appendChild(divClose);
    divParent.setAttribute("onmouseenter","postponeClose(this);");
    divParent.setAttribute("onmouseleave","contClose(this);");
    const element = document.getElementById("my-toast");
    element.appendChild(divParent);

    let timer = setTimeout(function() {
            closeToast(divClose);
        }, 4000)
    arrTimeOut.push(timer);
    arrEleStart.push(divParent);
}
function addInfo(content){
    const divIcon = document.createElement("div");
    divIcon.classList.add("my-toast__icon")
    divIcon.classList.add("my-toast__icon--info")
    const iIcon = document.createElement("i");
    iIcon.classList.add("fa");
    iIcon.classList.add("fa-thin");
    iIcon.classList.add("fa-circle-info");
    divIcon.appendChild(iIcon);

    const divBody = document.createElement("div");
    divBody.classList.add("my-toast__body");
    const h3 = document.createElement("h3");
    h3.classList.add("my-toast__status");
    const textStatus = document.createTextNode("Information");
    h3.appendChild(textStatus);
    const p = document.createElement("p");
    p.classList.add("my-toast__msg");
    const textMsg = document.createTextNode(content);
    p.appendChild(textMsg);
    divBody.appendChild(h3);
    divBody.appendChild(p);

    const divClose = document.createElement("div");
    divClose.classList.add("my-toast__close");
    divClose.setAttribute("onclick","closeToast(this);");
    const iClose = document.createElement("i");
    iClose.classList.add("fa");
    iClose.classList.add("fa-light");
    iClose.classList.add("fa-xmark");
    divClose.appendChild(iClose);

    const divParent = document.createElement("div");
    divParent.classList.add("my-toast");
    divParent.classList.add("my-toast--info");
    divParent.appendChild(divIcon);
    divParent.appendChild(divBody);
    divParent.appendChild(divClose);
    divParent.setAttribute("onmouseenter","postponeClose(this);");
    divParent.setAttribute("onmouseleave","contClose(this);");
    const element = document.getElementById("my-toast");
    element.appendChild(divParent)

    let timer = setTimeout(function() {
            closeToast(divClose);
        }, 4000)
    arrTimeOut.push(timer);
    arrEleStart.push(divParent);
}
function addWarning(content){
    const divIcon = document.createElement("div");
    divIcon.classList.add("my-toast__icon")
    divIcon.classList.add("my-toast__icon--warning")
    const iIcon = document.createElement("i");
    iIcon.classList.add("fa");
    iIcon.classList.add("fa-thin");
    iIcon.classList.add("fa-circle-exclamation");
    divIcon.appendChild(iIcon);

    const divBody = document.createElement("div");
    divBody.classList.add("my-toast__body");
    const h3 = document.createElement("h3");
    h3.classList.add("my-toast__status");
    const textStatus = document.createTextNode("Warning");
    h3.appendChild(textStatus);
    const p = document.createElement("p");
    p.classList.add("my-toast__msg");
    const textMsg = document.createTextNode(content);
    p.appendChild(textMsg);
    divBody.appendChild(h3);
    divBody.appendChild(p);

    const divClose = document.createElement("div");
    divClose.classList.add("my-toast__close");
    divClose.setAttribute("onclick","closeToast(this);");
    const iClose = document.createElement("i");
    iClose.classList.add("fa");
    iClose.classList.add("fa-light");
    iClose.classList.add("fa-xmark");
    divClose.appendChild(iClose);

    const divParent = document.createElement("div");
    divParent.classList.add("my-toast");
    divParent.classList.add("my-toast--warning");
    divParent.appendChild(divIcon)
    divParent.appendChild(divBody)
    divParent.appendChild(divClose);
    divParent.setAttribute("onmouseenter","postponeClose(this);");
    divParent.setAttribute("onmouseleave","contClose(this);");
    const element = document.getElementById("my-toast");
    element.appendChild(divParent);
    let timer = setTimeout(function() {
            closeToast(divClose);
        }, 4000)
    arrTimeOut.push(timer);
    arrEleStart.push(divParent);
}
function addError(content){
    const divIcon = document.createElement("div");
    divIcon.classList.add("my-toast__icon")
    divIcon.classList.add("my-toast__icon--error")
    const iIcon = document.createElement("i");
    iIcon.classList.add("fa");
    iIcon.classList.add("fa-thin");
    iIcon.classList.add("fa-circle-xmark");
    divIcon.appendChild(iIcon);

    const divBody = document.createElement("div");
    divBody.classList.add("my-toast__body");
    const h3 = document.createElement("h3");
    h3.classList.add("my-toast__status");
    const textStatus = document.createTextNode("Error");
    h3.appendChild(textStatus);
    const p = document.createElement("p");
    p.classList.add("my-toast__msg");
    const textMsg = document.createTextNode(content);
    p.appendChild(textMsg);
    divBody.appendChild(h3);
    divBody.appendChild(p);

    const divClose = document.createElement("div");
    divClose.classList.add("my-toast__close");
    divClose.setAttribute("onclick","closeToast(this);");
    const iClose = document.createElement("i");
    iClose.classList.add("fa");
    iClose.classList.add("fa-light");
    iClose.classList.add("fa-xmark");
    divClose.appendChild(iClose);

    const divParent = document.createElement("div");
    divParent.classList.add("my-toast");
    divParent.classList.add("my-toast--error");
    divParent.appendChild(divIcon)
    divParent.appendChild(divBody)
    divParent.appendChild(divClose);
    divParent.setAttribute("onmouseenter","postponeClose(this);");
    divParent.setAttribute("onmouseleave","contClose(this);");
    const element = document.getElementById("my-toast");
    element.appendChild(divParent);

    let timer = setTimeout(function() {
            closeToast(divClose);
        }, 4000)
    arrTimeOut.push(timer);
    arrEleStart.push(divParent);
}
function postponeClose(t){
    let idx = arrEleStart.indexOf(t);
    if(idx>=0){
        t.style.animation = "showup 0.5s ease";
        const tmer = arrTimeOut[idx];
        arrTimeOut.splice(idx,1);
        arrEleStart.splice(idx,1);
        clearTimeout(tmer);
    }
}
function contClose(t){
    t.style.animation = "showup 0.5s ease, fadeOut 1s 2s ease forwards";
    let timer = setTimeout(function() {
            closeToast(t.firstChild);
        }, 4000);
    arrEleStart.push(t);
    arrTimeOut.push(timer);
}