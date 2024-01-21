'use strict';

import { fetchData } from "./api.js";

/**
 * Adds event listeners to multiple elements.
 *
 * @param {NodeList} elements - NodeList of elements
 * @param {String} eventType - Event type string
 * @param {Function} callback - Callback function
 */
const addEventOnElements = function (elements, eventType, callback) {
    for (const item of elements) {
        item.addEventListener(eventType, callback);
    }
}

const header = document.querySelector("[data-header]");

window.addEventListener("scroll", function () {
    header.classList[window.scrollY > 50 ? "add" : "remove"]("active");
});

const searchToggler = document.querySelector("[data-search-toggler]");
const searchField = document.querySelector("[data-search-field]");
const $searchField = document.querySelector("[data-search-field]");

let isExpanded = false;

searchToggler.addEventListener("click", function () {
    header.classList.toggle("search-active");
    isExpanded = !isExpanded;
    this.setAttribute("aria-expanded", isExpanded);
    searchField.focus();
});


// Tab Navigation

const $tabBtns = document.querySelectorAll("[data-tab-btn]");
const $tabPanels = document.querySelectorAll("[data-tab-panel]");

let $lastActiveTabBtn = $tabBtns[0]; 
let $lastActiveTabPanel = $tabPanels[0];

addEventOnElements($tabBtns, "click", function() {
    $lastActiveTabBtn.setAttribute("aria-selected", "false");
    $lastActiveTabPanel.setAttribute("hidden", "");

    this.setAttribute("aria-selected", "true");
    const $currentTabPanel = document.querySelector(`#${this.getAttribute("aria-controls")}`);
    $currentTabPanel.removeAttribute("hidden");

    $lastActiveTabBtn = this;
    $lastActiveTabPanel = $currentTabPanel;
});

// keyboard accessibility 

addEventOnElements($tabBtns, "keydown", function(e) {
    const $nextElement = this.nextElementSibling;
    const $previousElement = this.previousElementSibling;

    if (e.key === "ArrowRight" && $nextElement) {
        this.setAttribute("tabindex", "-1");
        $nextElement.setAttribute("tabindex", "0");
        $nextElement.focus();
    } else if (e.key === "ArrowLeft" && $previousElement) {
        this.setAttribute("tabindex", "-1");
        $previousElement.setAttribute("tabindex", "0");
        $previousElement.focus();
    }
});

// Working API
 const $searchSubmit = document.querySelector("[data-search-submit]");

let apiUrl = "https://api.github.com/users/saha-sagnik";
 let repoUrl, followerUrl, followingUrl = "";


 const searchUser = function(){
   if(!$searchField.value)
  return;
    apiUrl  = `https://api.github.com/users/${$searchField.value}`;
    console.log(apiUrl);

    updateProfile(apiUrl);
    updateProfile(apiUrl)
    .then(() => {
        updateRepository();
    })
    .catch((error) => {
        console.error('Error updating profile:', error)
    });
}

$searchSubmit.addEventListener("click", searchUser);

// // Search when press Enter key

 $searchField.addEventListener("keydown", e=>{
   if(e.code ==="Enter"){
    searchUser();
  }
 });

const $profileCard = document.querySelector(
    "[data-profile-card]"
);



const $repoPanel = document.querySelector("[data-repo-panel]");

const $error = document.querySelector("[data-error]");

window.updateProfile = function(profileUrl) {
    return new Promise((resolve, reject) => {
        $error.style.display = "none";
        document.body.style.overflowY = "visible";

        $profileCard.innerHTML = `
            <div class="profile-skeleton">
                <div class="skeleton avatar-skeleton"></div>
                <div class="skeleton title-skeleton"></div>
                <div class="skeleton text-skeleton text-1"></div>
                <div class="skeleton text-skeleton text-2"></div>
                <div class="skeleton text-skeleton text-3"></div>
            </div>
        `;

        $tabBtns[0].click();
        $repoPanel.innerHTML = `
            <div class="card repo-skeleton">
                <div class="card-body">
                    <div class="skeleton title-skeleton"></div>
                    <div class="skeleton text-skeleton text-1"></div>
                    <div class="skeleton text-skeleton text-2"></div>
                </div>
                <div class="card-footer">
                    <div class="skeleton text-skeleton"></div>
                    <div class="skeleton text-skeleton"></div>
                    <div class="skeleton text-skeleton"></div>
                </div>
            </div>
        `.repeat(6);

        fetchData(profileUrl, data => {
            const {
                type,
                avatar_url,
                name,
                login: username,
                bio,
                location,
                html_url: githubPage,
                public_repos,
                followers,
                following,
                followers_url,
                following_url,
                repos_url
            } = data;

            repoUrl = repos_url;
            followerUrl = followers_url;
            followingUrl = following_url.replace("{/other_user}", "");
            $profileCard.innerHTML = `
                <figure class="${type === "User" ? "avatar-circle" : "avatar-rounded"}  img-holder" style="--width:100;--height:100">
                    <img src="${avatar_url}" width="280" height="280" class="${username}" alt="">
                </figure>

                ${name ? `<h1 class="title-2">${name}</h1>` : ""}
                <p class="username text-primary">${username}</p>
                ${bio ? `<p class="bio">${bio}</p>` : ""}
                <a href="${githubPage}" target="_blank" class="btn btn-secondary">
                    <span class="material-symbols-rounded" aria-hidden="true">open_in_new</span>
                    <span class="span">See on GitHub</span>
                </a>

                <ul class="profile-meta">
                    ${location ?
                `<li class="meta-item">
                        <span class="material-symbols-rounded" aria-hidden="true">location_on</span>
                        <span class="meta-text">${location}</span>
                    </li>` : ""
            }
                </ul>

                <ul class="profile-stats">
                    <li class="stats-item">
                        <span class="body">${public_repos}</span>Repos
                    </li>
                    <li class="stats-item">
                        <span class="body">${followers}</span>Followers
                    </li>
                    <li class="stats-item">
                        <span class="body">${following}</span>Following
                    </li>
                </ul>`;
            resolve(); // Resolve the Promise when the profile update is done
        }, () => {
            $error.style.display = "grid";
            document.body.style.overflowY = "hidden";
            $error.innerHTML = `
                <p class="title-1">Oops! :(</p>
                <p class="text">There is no account with this username yet.</p>
            `;
            reject('Error updating profile'); // Reject the Promise on error
        });
    });
};




//  Repository

let forkedRepos = [];

const updateRepository = function() {
    console.log('Updating repository...');
    console.log('repoUrl:', repoUrl);
    fetchData(`${repoUrl}?sort=created&per_page=10`, function(data) {
        
        console.log('Repository data:', data);
        console.log('Making API request to:', repoUrl);
        
        $repoPanel.innerHTML = `<h2 class="sr-only">Repositories</h2>`;
        forkedRepos = data.filter(item => item.fork);

        const repositories = data.filter(i => !i.fork);
        if (repositories.length) {
            for (const repo of repositories) {
                const {
                    name,
                    html_url,
                    description,
                    private: isPrivate,
                    language,
                    stargazers_count: stars_count,
                    forks_count
                } = repo;

                const $repoCard = document.createElement("article");
                $repoCard.classList.add("card", "repo-card");

                $repoCard.innerHTML = `
                    <div class="card-body">
                        <a href="${html_url}" target="_blank" class="card-title">
                            <h3 class="title-3">${name}</h3>
                        </a>

                        ${description ? `<p class="card-text">${description}</p>` : ""}
                        
                        <span class="badge">
                            ${isPrivate ? "Private" : "Public"}
                        </span>
                    </div>

                    <div class="card-footer">
                        ${language ? 
                            `<div class="meta-item">
                                <span class="material-symbols-rounded" aria-hidden="true">code_blocks</span>
                                <span class="span">${language}</span>
                            </div>` : ""
                        }

                        <div class="meta-item">
                            <span class="material-symbols-rounded" aria-hidden="true">star_rate</span>
                            <span class="span">${stars_count}</span>
                        </div>

                        <div class="meta-item">
                            <span class="material-symbols-rounded" aria-hidden="true">family_history</span>
                            <span class="span">${forks_count}</span>
                        </div>
                    </div>`;
                
                $repoPanel.appendChild($repoCard);
            }
        } else {
            $repoPanel.innerHTML = `
                <div class="error-content">
                    <p class="title-1">Oops! :(</p>
                    <p class="text">
                        Doesn't have any public repositories yet.
                    </p>
                </div>`;
        }
    });
};



const $forkTabBtn = document.querySelector("[data-forked-tab-btn]");
const $forkedPanel = document.querySelector("[data-fork-panel]"); 

const updateForkRepo = function(){
    if (forkedRepos.length) {
        for (const repo of forkedRepos) {
            const {
                name,
                html_url,
                description,
                private: isPrivate,
                language,
                stargazers_count: stars_count,
                forks_count
            } = repo;

            const $forkCard = document.createElement("article");
            $forkCard.classList.add("card", "repo-card");

            $forkCard.innerHTML = `
                <div class="card-body">
                    <a href="${html_url}" target="_blank" class="card-title">
                        <h3 class="title-3">${name}</h3>
                    </a>

                    ${description ? `<p class="card-text">${description}</p>` : ""}
                    
                    <span class="badge">
                        ${isPrivate ? "Private" : "Public"}
                    </span>
                </div>

                <div class="card-footer">
                    ${language ? 
                        `<div class="meta-item">
                            <span class="material-symbols-rounded" aria-hidden="true">code_blocks</span>
                            <span class="span">${language}</span>
                        </div>` : ""
                    }

                    <div class="meta-item">
                        <span class="material-symbols-rounded" aria-hidden="true">star_rate</span>
                        <span class="span">${stars_count}</span>
                    </div>

                    <div class="meta-item">
                        <span class="material-symbols-rounded" aria-hidden="true">family_history</span>
                        <span class="span">${forks_count}</span>
                    </div>
                </div>`;
            
            $forkedPanel.appendChild($forkCard);
        }
    } else {
        $forkedPanel.innerHTML = `
            <div class="error-content">
                <p class="title-1">Oops! :(</p>
                <p class="text">
                    Doesn't have any forked repositories yet.
                </p>
            </div>`;
    }
}

$forkTabBtn.addEventListener("click", updateForkRepo);

const $followerTabBtns = document.querySelectorAll("[data-follower-tab-btn]");
const $followerPanel = document.querySelector("[data-follower-panel]");

const updateFollower = function () {
    $followerPanel.innerHTML = `
        <div class="card follower-skeleton">
            <div class="skeleton avatar-skeleton"></div>
            <div class="skeleton title-skeleton"></div>
        </div>
    `.repeat(12);

    fetchData(followerUrl, function (data) {
        console.log('Follower data:', data);
        $followerPanel.innerHTML = `<h2 class="sr-only">Followers</h2>`;

        if (data.length) {
            for (const item of data) {
                const { login: username, avatar_url, url } = item;

                const $followerCard = document.createElement("article");
                $followerCard.classList.add("card", "follower-card");

                $followerCard.innerHTML = `
                    <figure class="avatar-circle img-holder">
                        <img src="${avatar_url}" width="56" height="56" 
                            loading="lazy" alt="${username}" class="img-cover">
                    </figure>
                    <h3 class="card-title">${username}</h3>
                    <button class="icon-btn" onclick="updateProfile('${url}')" aria-label="Go to ${username} profile">
                        <span class="material-symbols-rounded" aria-hidden="true">link</span>
                    </button>
                `;
                $followerPanel.appendChild($followerCard);
            }
        } else {
            $followerPanel.innerHTML = `
                <div class="error-content">
                    <p class="title-1">Oops! :(</p>
                    <p class="text">Doesn't have any followers yet.</p>
                </div>`;
        }
    });
}


$followerTabBtns.forEach(($followerTabBtn) => {
    $followerTabBtn.addEventListener("click", updateFollower);
});


const $followingTabBtn = document.querySelector("[data-following-tab-btn]");
const $followingPanel = document.querySelector("[data-following-panel]");

const updateFollowing = function () {
    $followingPanel.innerHTML = `
    <div class="card follower-skeleton">
        <div class="skeleton avatar-skeleton"></div>
        <div class="skeleton title-skeleton"></div>
    </div>
`.repeat(12);

    fetchData(following, function(data){
        $followingPanel.innerHTML = ` <h2 class="sr-only">Followings</h2>`;

        if (data.length) {
            for (const item of data) {
                const { login: username, avatar_url, url } = item;

                const $followingCard = document.createElement("article");
                $followingCard.classList.add("card", "follower-card");

                $followingCard.innerHTML = `
                    <figure class="avatar-circle img-holder">
                        <img src="${avatar_url}" width="56" height="56" 
                            loading="lazy" alt="${username}" class="img-cover">
                    </figure>
                    <h3 class="card-title">${username}</h3>
                    <button class="icon-btn" onclick="updateProfile('${url}')" aria-label="Go to ${username} profile">
                        <span class="material-symbols-rounded" aria-hidden="true">link</span>
                    </button>
                `;
                $followingPanel.appendChild($followingCard);
            }
        } else {
            $followingPanel.innerHTML = `
            <div class="error-content">
            <p class="title-1">Oops! :(</p>
            <p class="text">
                Doesn't have any following yet.
            </p>
        </div>`;
        }
    });


}

$followingTabBtn.addEventListener("click", updateFollowing);

