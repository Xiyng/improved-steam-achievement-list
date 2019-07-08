// ==UserScript==
// @name     Improved Steam Achievement List
// @version  0.1
// @author   Xiyng
// @include  https://steamcommunity.com/id/*/stats/*
// @run-at   document-end
// ==/UserScript==

const monthAbbreviations = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
addSortButton();

function addSortButton() {
    const globalStatsLinkElement = document.querySelector("#topSummaryLeft a");
    const sortButton = document.createElement("a");
    sortButton.textContent = "Sort by date";
    sortButton.addEventListener("click", handleSortButtonClickEvent);
    globalStatsLinkElement.parentNode.append(sortButton);
}

function handleSortButtonClickEvent(event) {
    event.preventDefault();
    sortAchievedAchievements();
}

function sortAchievedAchievements() {
    // TODO: The sorting method used here isn't stable. Make it stable!
    const achievementRows = getAchievedAchievementRows();
    const sortedRows = sortElements(achievementRows, compareAchievementRowsDescending);
    const achievementList = getAchievementList();
    for (let row of sortedRows) {
        achievementList.removeChild(row);
    }
    let nextElement = achievementList.firstChild;
    for (let row of sortedRows) {
        achievementList.insertBefore(row, nextElement);
        nextElement = row;
    }
}

function getAchievedAchievementRows() {
    const achievementList = getAchievementList();
    const listChildren = achievementList.children;
    const achievementRows = [];
    for (let i = 0; i < listChildren.length; i++) {
        const child = listChildren[i];
        if (!child.classList.contains("achieveRow")) {
            break;
        }
        achievementRows.push(child);
    }
    return achievementRows;
}

function getAchievementList() {
    return document.querySelector("#personalAchieve");
}

function compareAchievementRowsDescending(row1, row2) {
    return -compareAchievementRowsAscending(row1, row2);
}

function compareAchievementRowsAscending(row1, row2) {
    return parseAchievementMoment(row2).getTime() - parseAchievementMoment(row1).getTime();
}

function sortElements(elements, compareFunction) {
    const elementArray = [];
    for (let i = 0; i < elements.length; i++) {
        elementArray.push(elements[i]);
    }
    elementArray.sort(compareFunction);
    return elementArray;
}

function parseAchievementMoment(achievementRow) {
    const momentText = getAchievementMomentText(achievementRow);
    const momentTokens = momentText.replace(",", "").replace("@ ", "").split(" ");
    const day = Number.parseInt(momentTokens[0], 10);
    const monthString = momentTokens[1];
    const monthIndex = monthAbbreviations.indexOf(monthString);
    const isCurrentYear = momentTokens[2].includes(":");
    const year = isCurrentYear ? new Date().getFullYear() : Number.parseInt(momentTokens[2], 10);
    const time12h = isCurrentYear ? momentTokens[2] : momentTokens[3];
    const time24h = parse24hTimeFrom12hTime(time12h);
    const moment = new Date(year, monthIndex, day, time24h.hours, time24h.minutes);
    return moment;
}

function getAchievementMomentText(achievementRow) {
    const momentTextNode = achievementRow.querySelector(".achieveTxtHolder .achieveUnlockTime");
    const momentText = momentTextNode.textContent.trim();
    const momentStartIndex = momentText.search(/[0-9]/);
    return momentText.substring(momentStartIndex);
}

function parse24hTimeFrom12hTime(time) {
    const isAm = time.includes("am");
    const isPm = time.includes("pm");
    if (!isAm && !isPm) {
        throw new Error("Not a valid 12 h time");
    }
    const splitTime = time.split(":");
    const hours = Number.parseInt(splitTime[0], 10);
    const minutes = Number.parseInt(splitTime[1], 10); // because parseInt parses as far as it can
    return {
        hours: isAm ? (hours !== 12 ? hours : 0) : (hours == 12 ? hours: hours + 12),
        minutes: minutes
    }
}