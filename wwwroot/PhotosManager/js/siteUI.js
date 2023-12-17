let contentScrollPosition = 0;
let sortType = "date";
let keywords = "";
let loginMessage = "";
let Email = "";
let EmailError = "";
let passwordError = "";
let currentETag = "";
let currentViewName = "photosList";
let delayTimeOut = 200; // seconds
let message = "";
// pour la pagination
let photoContainerWidth = 400;
let photoContainerHeight = 400;
let limit;
let HorizontalPhotosCount;
let VerticalPhotosCount;
let offset = 0;
//
let whiteThumbs = "fa-regular fa-thumbs-up";
let blueThumbs = "fa fa-thumbs-up";
let likeDetail = 0;

Init_UI();

function Init_UI() {
    // getViewPortPhotosRanges();
    // initTimeout(delayTimeOut, renderExpiredSession);
    // installWindowResizeHandler();
    // let user = API.retrieveLoggedUser();
    // if (user && user.VerifyCode === "verified") renderPhotos();
    // else if (user.VerifyCode !== "verified") renderVerify();
    // else renderLoginForm();
    getViewPortPhotosRanges();
    initTimeout(delayTimeOut, renderExpiredSession);
    installWindowResizeHandler();
    if (API.retrieveLoggedUser()) renderPhotos();
    else renderLoginForm();
}

// pour la pagination
function getViewPortPhotosRanges() {
    // estimate the value of limit according to height of content
    VerticalPhotosCount = Math.round(
        $("#content").innerHeight() / photoContainerHeight
    );
    HorizontalPhotosCount = Math.round(
        $("#content").innerWidth() / photoContainerWidth
    );
    limit = (VerticalPhotosCount + 1) * HorizontalPhotosCount;
    // console.log(
    //     "VerticalPhotosCount:",
    //     VerticalPhotosCount,
    //     "HorizontalPhotosCount:",
    //     HorizontalPhotosCount
    // );
    offset = 0;
}

// pour la pagination
function installWindowResizeHandler() {
    var resizeTimer = null;
    var resizeEndTriggerDelai = 250;
    $(window)
        .on("resize", function (e) {
            if (!resizeTimer) {
                $(window).trigger("resizestart");
            }
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                resizeTimer = null;
                $(window).trigger("resizeend");
            }, resizeEndTriggerDelai);
        })
        .on("resizestart", function () {
            console.log("resize start");
        })
        .on("resizeend", function () {
            console.log("resize end");
            if ($("#photosLayout") != null) {
                getViewPortPhotosRanges();
                if (currentViewName == "photosList") renderPhotosList();
            }
        });
}

function attachCmd() {
    $("#loginCmd").on("click", renderLoginForm);
    $("#logoutCmd").on("click", logout);
    $("#listPhotosCmd").on("click", renderPhotos);
    $("#listPhotosMenuCmd").on("click", renderPhotos);
    $("#editProfileMenuCmd").on("click", renderEditProfileForm);
    $("#renderManageUsersMenuCmd").on("click", renderManageUsers);
    $("#editProfileCmd").on("click", renderEditProfileForm);
    $("#aboutCmd").on("click", renderAbout);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Header management
function loggedUserMenu() {
    let loggedUser = API.retrieveLoggedUser();
    if (loggedUser) {
        let manageUserMenu = `
            <span class="dropdown-item" id="renderManageUsersMenuCmd">
                <i class="menuIcon fas fa-user-cog mx-2"></i> Gestion des usagers
            </span>
            <div class="dropdown-divider"></div>
        `;
        return `
            ${loggedUser.isAdmin ? manageUserMenu : ""}
            <span class="dropdown-item" id="logoutCmd">
                <i class="menuIcon fa fa-sign-out mx-2"></i> Déconnexion
            </span>
            <span class="dropdown-item" id="editProfileMenuCmd">
                <i class="menuIcon fa fa-user-edit mx-2"></i> Modifier votre profile
            </span>
            <div class="dropdown-divider"></div>
            <span class="dropdown-item" id="listPhotosMenuCmd">
                <i class="menuIcon fa fa-image mx-2"></i> Liste des photos
            </span>
        `;
    } else
        return `
            <span class="dropdown-item" id="loginCmd">
                <i class="menuIcon fa fa-sign-in mx-2"></i> Connexion
            </span>`;
}

function viewMenu(viewName) {
    if (viewName == "photosList") {
        // todo
        return "";
    } else return "";
}

function connectedUserAvatar() {
    let loggedUser = API.retrieveLoggedUser();
    if (loggedUser)
        return `
            <div class="UserAvatarSmall" userId="${loggedUser.Id}" id="editProfileCmd" style="background-image:url('${loggedUser.Avatar}')" title="${loggedUser.Name}"></div>
        `;
    return "";
}

function ownerAvatar(photo, isShared = false) {
    let images = `
        <div class="UserAvatarSmall" id="ownerPhoto" style="background-image:url('${photo.Owner.Avatar}')" title="${photo.OwnerName}"></div></i>        
        `;
    if (isShared) {
        images += `
            <div style="background-color: rgba(255,255,255,50%);border-radius: 60px" id="ownerPhoto" title="${photo.OwnerName}">
            <img class="UserAvatarSmall" src="images/shared.png" alt="">
        </div>
        `;
    }
    return images;
}

function refreshHeader() {
    UpdateHeader(currentViewTitle, currentViewName);
}

function UpdateHeader(viewTitle, viewName) {
    currentViewTitle = viewTitle;
    currentViewName = viewName;
    $("#header").empty();
    $("#header").append(`
        <span title="Liste des photos" id="listPhotosCmd"><img src="images/PhotoCloudLogo.png" class="appLogo"></span>
        <span class="viewTitle">${viewTitle} 
            <div class="cmdIcon fa fa-plus" id="newPhotoCmd" title="Ajouter une photo"></div>
        </span>

        <div class="headerMenusContainer">
            <span>&nbsp</span> <!--filler-->
            <i title="Modifier votre profile"> ${connectedUserAvatar()} </i>         
            <div class="dropdown ms-auto dropdownLayout">
                <div data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="cmdIcon fa fa-ellipsis-vertical"></i>
                </div>
                <div class="dropdown-menu noselect">
                    ${loggedUserMenu()}
                    ${viewMenu(viewName)}
                    <div class="dropdown-divider"></div>
                    <span class="dropdown-item" id="aboutCmd">
                        <i class="menuIcon fa fa-info-circle mx-2"></i> À propos...
                    </span>
                </div>
            </div>

        </div>
    `);
    if (sortType == "keywords" && viewName == "photosList") {
        $("#customHeader").show();
        $("#customHeader").empty();
        $("#customHeader").append(`
            <div class="searchContainer">
                <input type="search" class="form-control" placeholder="Recherche par mots-clés" id="keywords" value="${keywords}"/>
                <i class="cmdIcon fa fa-search" id="setSearchKeywordsCmd"></i>
            </div>
        `);
    } else {
        $("#customHeader").hide();
    }
    attachCmd();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Actions and command
async function login(credential) {
    console.log("login");
    loginMessage = "";
    EmailError = "";
    passwordError = "";
    Email = credential.Email;
    await API.login(credential.Email, credential.Password);
    if (API.error) {
        switch (API.currentStatus) {
            case 482:
                passwordError = "Mot de passe incorrect";
                renderLoginForm();
                break;
            case 481:
                EmailError = "Courriel introuvable";
                renderLoginForm();
                break;
            default:
                renderError("Le serveur ne répond pas");
                break;
        }
    } else {
        let loggedUser = API.retrieveLoggedUser();
        if (loggedUser.VerifyCode == "verified") {
            if (!loggedUser.isBlocked) renderPhotos();
            else {
                loginMessage = "Votre compte a été bloqué par l'administrateur";
                logout();
            }
        } else renderVerify();
    }
}

async function logout() {
    console.log("logout");
    await API.logout();
    renderLoginForm();
}

function isVerified() {
    let loggedUser = API.retrieveLoggedUser();
    return loggedUser.VerifyCode == "verified";
}

async function verify(verifyCode) {
    let loggedUser = API.retrieveLoggedUser();
    if (await API.verifyEmail(loggedUser.Id, verifyCode)) {
        renderPhotos();
    } else {
        renderError("Désolé, votre code de vérification n'est pas valide...");
    }
}

async function editProfile(profile) {
    if (await API.modifyUserProfile(profile)) {
        let loggedUser = API.retrieveLoggedUser();
        if (loggedUser) {
            if (isVerified()) {
                renderPhotos();
            } else renderVerify();
        } else renderLoginForm();
    } else {
        renderError("Un problème est survenu.");
    }
}

async function createProfile(profile) {
    if (await API.register(profile)) {
        loginMessage =
            "Votre compte a été créé. Veuillez prendre vos courriels pour réccupérer votre code de vérification qui vous sera demandé lors de votre prochaine connexion.";
        renderLoginForm();
    } else {
        renderError("Un problème est survenu.");
    }
}

async function createPhoto(photo) {
    if (await API.CreatePhoto(photo)) {
        message =
            "Votre photo a bien été crée et selon votre choix, partagé !";
        renderPhotos();
    } else {
        renderError("Problème survenu lors de la création d'une photo");
    }
}

async function updatePhoto(photo) {
    if (await API.UpdatePhoto(photo)) {
        message =
            "Votre photo a bien été modifiée et selon votre choix, partagé !";
        renderPhotos();
    } else {
        renderError("Problème survenu lors de la création d'une photo");
    }
}

async function deletePhoto(photoId) {
    if (await API.DeletePhoto(photoId)) {
        message =
            "Votre photo a bien été effacée.";
        renderPhotos();
    } else {
        renderError("Problème survenu lors de l'efface de la photo");
    }
}

async function adminDeleteAccount(userId) {
    if (await API.unsubscribeAccount(userId)) {
        renderManageUsers();
    } else {
        renderError("Un problème est survenu.");
    }
}

async function deleteProfile() {
    let loggedUser = API.retrieveLoggedUser();
    if (loggedUser) {
        if (await API.unsubscribeAccount(loggedUser.Id)) {
            loginMessage = "Votre compte a été effacé.";
            logout();
        } else renderError("Un problème est survenu.");
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Views rendering
function showWaitingGif() {
    eraseContent();
    $("#content").append(
        $(
            "<div class='waitingGifcontainer'><img class='waitingGif' src='images/Loading_icon.gif' /></div>'"
        )
    );
}

function eraseContent() {
    $("#content").empty();
}

function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}

function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}

async function renderError(message) {
    noTimeout();
    switch (API.currentStatus) {
        case 401:
        case 403:
        case 405:
            message =
                "Accès refusé...Expiration de votre session. Veuillez vous reconnecter.";
            await API.logout();
            renderLoginForm();
            break;
        case 404:
            message = "Ressource introuvable...";
            break;
        case 409:
            message = "Ressource conflictuelle...";
            break;
        default:
            if (!message) message = "Un problème est survenu...";
    }
    saveContentScrollPosition();
    eraseContent();
    UpdateHeader("Problème", "error");
    $("#newPhotoCmd").hide();
    $("#content").append(
        $(`
            <div class="errorContainer">
                <b>${message}</b>
            </div>
            <hr>
            <div class="form">
                <button id="connectCmd" class="form-control btn-primary">Connexion</button>
            </div>
        `)
    );
    $("#connectCmd").on("click", renderLoginForm);
    /* pour debug
       $("#content").append(
          $(`
              <div class="errorContainer">
                  <b>${message}</b>
              </div>
              <hr>
              <div class="systemErrorContainer">
                  <b>Message du serveur</b> : <br>
                  ${API.currentHttpError} <br>

                  <b>Status Http</b> :
                  ${API.currentStatus}
              </div>
          `)
      ); */
}

function renderAbout() {
    timeout();
    saveContentScrollPosition();
    eraseContent();
    UpdateHeader("À propos...", "about");
    $("#newPhotoCmd").hide();
    $("#createContact").hide();
    $("#abort").show();
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de photos</h2>
                <hr>
                <p>
                    Petite application de gestion de photos multiusagers à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: vos noms d'équipiers
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `)
    );
}

async function renderPhotos() {
    timeout();
    showWaitingGif();
    UpdateHeader("Liste des photos", "photosList");
    $("#newPhotoCmd").show();
    $("#newPhotoCmd").on("click", renderPhotoPublication);
    $("#abort").hide();
    let loggedUser = API.retrieveLoggedUser();
    if (loggedUser) {
        renderPhotosList();
    } else {
        renderLoginForm();
    }
}

async function renderPhotoPublication() {
    timeout();
    showWaitingGif();
    UpdateHeader("Publication photo", "createPhoto");
    let loggedUser = API.retrieveLoggedUser();
    if (loggedUser) {
        renderCreateNewPhoto();
    } else {
        renderLoginForm();
    }
}

async function renderPhotosList() {
    eraseContent();
    try {
        const result = await API.GetPhotos();

        $("#content").append(`<div class="photosLayout">`);

        if (!result) {
            throw new Error('Failed to fetch photos.');
        }

        const {data: photos, ETag} = result;
        let loggedUser = API.retrieveLoggedUser();
        for (let i = 0; i < photos.length; i++) {

            const photo = photos[i];
            let list = await API.getLikesPhoto(photo);
            let image = photo.Image
            let length = 0;
            if (image !== "") {
                    if(loggedUser.isAdmin || loggedUser.Id === photo.OwnerId || photo.Shared === true)
                    $("#content .photosLayout").append(`
                        <div class="photoLayout">
                            <div class="photoTitleContainer">
                                <span class="photoTitle">${photo.Title}</span>
                                ${photo.OwnerId === loggedUser.Id || loggedUser.isAdmin ? `
                                <span><i class="menuIcon fa-solid fa-pencil" data-photo-id="${photo.Id}" id="${photo.Id}modify"></i></span>
                                <span><i class="menuIcon fa-solid fa-trash" data-photo-id="${photo.Id}" id="${photo.Id}delete"></i></span>` : ''}
                            </div>
                            <div class="photoContainer">
                                ${photo.OwnerId === loggedUser.Id || loggedUser.isAdmin ? `
                                <div class="AvatarOverlay">
                                    ${ownerAvatar(photo,photo.Shared)}
                                </div>` : `
                                <div class="AvatarOverlay">
                                    ${ownerAvatar(photo,false)}
                                </div>`}
                                <img src="${photo.Image}" class="photoImage" id="${photo.Id}">
                            </div>
                            <span class="photoCreationDate">
                                ${photo.Date}
                                <div style="float: right">
                                    <div id="likeCount${photo.Id}" style="float: left;margin-right: 3px;">${length}</div>
                                <i class="fa-regular fa-thumbs-up" id="like${photo.Id}"></i>
                                <div class="LikeContainer">
                                    <div class="likesSummary"></div>
                                </div>
                                </div>
                            </span>
                        </div>
                    `);
                    list.forEach(like => {
                        if (photo.Id === like.PhotoId) {
                            $("#like"+photo.Id).removeClass(whiteThumbs).addClass(blueThumbs);
                            // console.log(like);
                            length++;
                            $("#likeCount"+photo.Id).text(length);
                        }
                    });
                    $(".LikeContainer").hide();

                    // Attach click event to the modifyIcon
                    $("#" + photo.Id + "modify").on("click", function (event) {
                        if (photo.OwnerId === loggedUser || loggedUser.isAdmin)
                            renderModifyPhotoForm(photo);
                    });

                    // Attach click event to the deleteIcon
                    $("#" + photo.Id + "delete").on("click", function (event) {
                        if (photo.OwnerId === loggedUser || loggedUser.isAdmin)
                            renderConfirmDeletePhoto(photo)
                    });
                // } else if(photo.Shared === true || loggedUser.isAdmin){
                //  $("#content .photosLayout").append(`
                // <div class="photoLayout">
                //     <div class="photoTitleContainer">
                //         <span class="photoTitle">${photo.Title}</span>
                //         <span></span>
                //     </div>
                //     <div class="photoContainer">
                //                 <div class="AvatarOverlay">
                //                     ${ownerAvatar(photo,photo.Shared)}
                //                 </div>
                //                 <img src="${photo.Image}" class="photoImage" id="${photo.Id}">
                //             </div>
                //     <span class="photoCreationDate">
                //         ${photo.Date}
                //         <div style="float: right">
                //             nbLikes
                //             <i class="fa-regular fa-thumbs-up" id="${photo.Id}like" ></i>
                //         </div>
                //      </span>
                // </div>
                // `);
                // }

                $("#" + photo.Id).on("click", function (event) {
                    renderPhotoDetails(photo);
                });
            } else renderError("Erreur avec l'affichage des photos...");
        }
        $("#content").append(`</div>`);
    } catch (error) {
        console.error('Error fetching photos:', error);

        if (error instanceof TypeError && error.response) {
            console.error('Full response:', error.response);
        }

        $("#content").append("<h2>Error fetching photos</h2>");
    }
}

function renderModifyPhotoForm(photo) {
    eraseContent();
    UpdateHeader("Modification de photo", "modifyPhoto");
    $("#newPhotoCmd").hide();
    $("#content").append(`
        <br/>
        <form class="form" id="modifyPhotoForm"'>
            <fieldset>
                <legend>Informations</legend>
                <input  type="text" 
                        class="form-control Alpha" 
                        name="Title" 
                        id="Title"
                        placeholder="Titre" 
                        required 
                        RequireMessage = 'Veuillez entrer un titre'
                        InvalidMessage = 'Titre invalide'
                        value = "${photo.Title}"/>
                <textarea class="form-control Alpha"
                          name="Description"
                          id="Description"
                          placeholder="Description"
                          required
                          RequireMessage = 'Veuillez entrer une description'
                          InvalidMessage = 'Description invalide'/>${photo.Description}</textarea>
                          <br/>
                <input type="checkbox" 
                        name="Share" 
                        id="Share" 
                        ${photo.Shared ? 'checked' : ''}>
                <label for="Share">Partagée</label>
            </fieldset>
            <fieldset>
                <legend>Image</legend>
                <div class='imageUploader' 
                        newImage='true' 
                        controlId='Image' 
                        imageSrc='${photo.Image}'
                        waitingImage="images/Loading_icon.gif">
            </div>
            </fieldset>
   
            <input type='submit' name='submit' id='savePhoto' value="Enregistrer" class="form-control btn-primary">
        </form>
        <div class="cancel">
            <button class="form-control btn-secondary" id="abortCreatePhotoCmd">Annuler</button>
        </div>
    `);
    initFormValidation();
    initImageUploaders();

    $("#abortCreatePhotoCmd").on("click", renderPhotos);
    $("#modifyPhotoForm").on("submit", function (event) {
        let photoData = getFormData($("#modifyPhotoForm"), true);
        let updatedPhoto = {};
        updatedPhoto['Id'] = photo.Id;
        updatedPhoto['OwnerId'] = photo.OwnerId;
        updatedPhoto['Title'] = photoData.Title;
        updatedPhoto['Description'] = photoData.Description;
        updatedPhoto['Image'] = photoData.Image;

        const currentDate = photo.Date;

        const formattedDate = currentDate.toLocaleString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        });

        const dayOfWeek = formattedDate.split(' ')[0];

        updatedPhoto['Date'] = `${dayOfWeek} le ${formattedDate.slice(formattedDate.indexOf(' ') + 1)}`;
        updatedPhoto['Shared'] = photoData.hasOwnProperty("Share")
        event.preventDefault();
        showWaitingGif();
        updatePhoto(updatedPhoto);
    });
}

async function renderPhotoDetails(photo) {
    eraseContent();
    let loggedUser = API.retrieveLoggedUser();
    UpdateHeader("Détails", "verify");
    $("#newPhotoCmd").hide();
    const imageUrl = photo.Image.startsWith("http") ? photo.Image : `../../assetsRepository/${photo.Image}`;
    if (loggedUser.Id !== photo.OwnerId) {
        $("#content").append(`
        <div class="menusContainer">
                <i class="photoDetailsOwner">
                ${ownerAvatar(photo)}
                <span class="photoTitleContainer">
                    <span class="UserName" style="margin-left: 5px">${photo.OwnerName}</span>
                </span>
            </div>
            <div class="dropdown-divider"></div>
    `);
    }
    let list = await API.getLikesPhoto(photo.Id);
    likeDetail = 0;
    list.forEach(like => {
        if (like.PhotoId === photo.Id)
            likeDetail++;
    });
    $("#content").append(`
        <div class="photoLayout">
            <span class="photoDetailsTitle">${photo.Title}</span>
            <img class="photoDetailsLargeImage" src="${imageUrl}">
            <span class="photoDetailsCreationDate">
                ${photo.Date}    
                <div style="float: right">
                    <div id="likeCount" style="float: left;margin-right: 3px;">${likeDetail}</div>
                    <i class="fa-regular fa-thumbs-up" id="like"></i>
                    
                    <div class="LikeContainer">
                        <div class="likesSummary">
                        </div>
                    </div>
                </div>
            </span>
            
            <span class="photoDetailsDescription">${photo.Description}</span>
        </div>
    `);
    await getLikesList(photo, loggedUser, list);
    await cmdPhotoDetails(photo, loggedUser, true, list);
}

async function cmdPhotoDetails(photo, loggedUser, inDetails = false, list) {
    let likeData = {}
    likeData['UserId'] = loggedUser.Id;
    likeData['PhotoId'] = photo.Id;
    likeData['UserAndPhotoId'] = loggedUser.Id + photo.Id;
    let like = $("#like");
    let likeInfo = $(".LikeContainer");
    likeInfo.hide();
    like.hover(
        function (e) {
            likeInfo.show();
        },
        function (e) {
            likeInfo.hide();
        }
    );
    likeInfo.hover(
        function (e) {
            likeInfo.show();
        },
        function (e) {
            likeInfo.hide();
        }
    );

    like.on("click", function (e) {
        if (inDetails) {
            if (like.attr("class") === whiteThumbs) {
                like.removeClass(whiteThumbs).addClass(blueThumbs);
                API.LikePhoto(likeData)
            } else if (blueThumbs) {
                let idLike = "";
                like.removeClass(blueThumbs).addClass(whiteThumbs);
                list.forEach(like => {
                    if (like.UserId === loggedUser.Id && like.PhotoId === photo.Id) {
                        idLike = like.Id;
                    }
                });
                API.dislikePhoto(idLike);
            }
            UpdateLike(photo);
        }
    });
}

async function UpdateLike(photo) {
    let likes = await API.getLikesPhoto();
    let loggedUser = await API.retrieveLoggedUser();
    likeDetail = 0;
    likes.forEach(like => {
        if (loggedUser.Id+photo.Id === like.UserAndPhotoId)
            likeDetail++;
    });
    $("#likeCount").text(likeDetail);
}

async function getLikesList(photo, loggedUser, list) {

    let likeInfo = $(".likesSummary");
    for (let i = 0; i < list.length; i++) {
        let user = await API.GetAccount(list[i].UserId);
        if (loggedUser.Id+photo.Id === list[i].UserAndPhotoId){
            $("#like").removeClass(whiteThumbs).addClass(blueThumbs);

        }
        if(photo.Id === list[i].PhotoId){
            likeInfo.append(`
                <span>${user.data.Name}</span><br>
                `);
        }
    }
}

function renderVerify() {
    eraseContent();
    UpdateHeader("Vérification", "verify");
    $("#newPhotoCmd").hide();
    $("#content").append(`
        <div class="content">
            <form class="form" id="verifyForm">
                <b>Veuillez entrer le code de vérification de que vous avez reçu par courriel</b>
                <input  type='text' 
                        name='Code'
                        class="form-control"
                        required
                        RequireMessage = 'Veuillez entrer le code que vous avez reçu par courriel'
                        InvalidMessage = 'Courriel invalide';
                        placeholder="Code de vérification de courriel" > 
                <input type='submit' name='submit' value="Vérifier" class="form-control btn-primary">
            </form>
        </div>
    `);
    initFormValidation(); // important do to after all html injection!
    $("#verifyForm").on("submit", function (event) {
        let verifyForm = getFormData($("#verifyForm"));
        event.preventDefault();
        showWaitingGif();
        verify(verifyForm.Code);
    });
}

function renderCreateProfile() {
    noTimeout();
    eraseContent();
    UpdateHeader("Inscription", "createProfile");
    $("#newPhotoCmd").hide();
    $("#content").append(`
        <br/>
        <form class="form" id="createProfileForm"'>
            <fieldset>
                <legend>Adresse ce courriel</legend>
                <input  type="email" 
                        class="form-control Email" 
                        name="Email" 
                        id="Email"
                        placeholder="Courriel" 
                        required 
                        RequireMessage = 'Veuillez entrer votre courriel'
                        InvalidMessage = 'Courriel invalide'
                        CustomErrorMessage ="Ce courriel est déjà utilisé"/>

                <input  class="form-control MatchedInput" 
                        type="text" 
                        matchedInputId="Email"
                        name="matchedEmail" 
                        id="matchedEmail" 
                        placeholder="Vérification" 
                        required
                        RequireMessage = 'Veuillez entrez de nouveau votre courriel'
                        InvalidMessage="Les courriels ne correspondent pas" />
            </fieldset>
            <fieldset>
                <legend>Mot de passe</legend>
                <input  type="password" 
                        class="form-control" 
                        name="Password" 
                        id="Password"
                        placeholder="Mot de passe" 
                        required 
                        RequireMessage = 'Veuillez entrer un mot de passe'
                        InvalidMessage = 'Mot de passe trop court'/>

                <input  class="form-control MatchedInput" 
                        type="password" 
                        matchedInputId="Password"
                        name="matchedPassword" 
                        id="matchedPassword" 
                        placeholder="Vérification" required
                        InvalidMessage="Ne correspond pas au mot de passe" />
            </fieldset>
            <fieldset>
                <legend>Nom</legend>
                <input  type="text" 
                        class="form-control Alpha" 
                        name="Name" 
                        id="Name"
                        placeholder="Nom" 
                        required 
                        RequireMessage = 'Veuillez entrer votre nom'
                        InvalidMessage = 'Nom invalide'/>
            </fieldset>
            <fieldset>
                <legend>Avatar</legend>
                <div class='imageUploader' 
                        newImage='true' 
                        controlId='Avatar' 
                        imageSrc='images/no-avatar.png' 
                        waitingImage="images/Loading_icon.gif">
            </div>
            </fieldset>
   
            <input type='submit' name='submit' id='saveUser' value="Enregistrer" class="form-control btn-primary">
        </form>
        <div class="cancel">
            <button class="form-control btn-secondary" id="abortCreateProfileCmd">Annuler</button>
        </div>
    `);
    $("#loginCmd").on("click", renderLoginForm);
    initFormValidation(); // important do to after all html injection!
    initImageUploaders();
    $("#abortCreateProfileCmd").on("click", renderLoginForm);
    addConflictValidation(API.checkConflictURL(), "Email", "saveUser");
    $("#createProfileForm").on("submit", function (event) {
        let profile = getFormData($("#createProfileForm"));
        delete profile.matchedPassword;
        delete profile.matchedEmail;
        event.preventDefault();
        showWaitingGif();
        createProfile(profile);
    });
}

async function renderManageUsers() {
    timeout();
    let loggedUser = API.retrieveLoggedUser();
    if (loggedUser.isAdmin) {
        if (isVerified()) {
            showWaitingGif();
            UpdateHeader("Gestion des usagers", "manageUsers");
            $("#newPhotoCmd").hide();
            $("#abort").hide();
            let users = await API.GetAccounts();
            if (API.error) {
                renderError();
            } else {
                $("#content").empty();
                users.data.forEach((user) => {
                    if (user.Id != loggedUser.Id) {
                        let typeIcon =
                            user.Authorizations.readAccess == 2
                                ? "fas fa-user-cog"
                                : "fas fa-user-alt";
                        typeTitle =
                            user.Authorizations.readAccess == 2
                                ? "Retirer le droit administrateur à"
                                : "Octroyer le droit administrateur à";
                        let blockedClass =
                            user.Authorizations.readAccess == -1
                                ? "class=' blockUserCmd cmdIconVisible fa fa-ban redCmd'"
                                : "class='blockUserCmd cmdIconVisible fa-regular fa-circle greenCmd'";
                        let blockedTitle =
                            user.Authorizations.readAccess == -1
                                ? "Débloquer $name"
                                : "Bloquer $name";
                        let userRow = `
                        <div class="UserRow"">
                            <div class="UserContainer noselect">
                                <div class="UserLayout">
                                    <div class="UserAvatar" style="background-image:url('${user.Avatar}')"></div>
                                    <div class="UserInfo">
                                        <span class="UserName">${user.Name}</span>
                                        <a href="mailto:${user.Email}" class="UserEmail" target="_blank" >${user.Email}</a>
                                    </div>
                                </div>
                                <div class="UserCommandPanel">
                                    <span class="promoteUserCmd cmdIconVisible ${typeIcon} dodgerblueCmd" title="${typeTitle} ${user.Name}" userId="${user.Id}"></span>
                                    <span ${blockedClass} title="${blockedTitle}" userId="${user.Id}" ></span>
                                    <span class="removeUserCmd cmdIconVisible fas fa-user-slash goldenrodCmd" title="Effacer ${user.Name}" userId="${user.Id}"></span>
                                </div>
                            </div>
                        </div>           
                        `;
                        $("#content").append(userRow);
                    }
                });
                $(".promoteUserCmd").on("click", async function () {
                    let userId = $(this).attr("userId");
                    await API.PromoteUser(userId);
                    renderManageUsers();
                });
                $(".blockUserCmd").on("click", async function () {
                    let userId = $(this).attr("userId");
                    await API.BlockUser(userId);
                    renderManageUsers();
                });
                $(".removeUserCmd").on("click", function () {
                    let userId = $(this).attr("userId");
                    renderConfirmDeleteAccount(userId);
                });
            }
        } else renderVerify();
    } else renderLoginForm();
}

async function renderConfirmDeleteAccount(userId) {
    timeout();
    let loggedUser = API.retrieveLoggedUser();
    if (loggedUser) {
        let userToDelete = (await API.GetAccount(userId)).data;
        if (!API.error) {
            eraseContent();
            UpdateHeader("Retrait de compte", "confirmDeleteAccount");
            $("#newPhotoCmd").hide();
            $("#content").append(`
                <div class="content loginForm">
                    <br>
                    <div class="form UserRow ">
                        <h4> Voulez-vous vraiment effacer cet usager et toutes ses photos? </h4>
                        <div class="UserContainer noselect">
                            <div class="UserLayout">
                                <div class="UserAvatar" style="background-image:url('${userToDelete.Avatar}')"></div>
                                <div class="UserInfo">
                                    <span class="UserName">${userToDelete.Name}</span>
                                    <a href="mailto:${userToDelete.Email}" class="UserEmail" target="_blank" >${userToDelete.Email}</a>
                                </div>
                            </div>
                        </div>
                    </div>           
                    <div class="form">
                        <button class="form-control btn-danger" id="deleteAccountCmd">Effacer</button>
                        <br>
                        <button class="form-control btn-secondary" id="abortDeleteAccountCmd">Annuler</button>
                    </div>
                </div>
            `);
            $("#deleteAccountCmd").on("click", function () {
                adminDeleteAccount(userToDelete.Id);
            });
            $("#abortDeleteAccountCmd").on("click", renderManageUsers);
        } else {
            renderError("Une erreur est survenue");
        }
    }
}

async function renderConfirmDeletePhoto(photo) {
    timeout();
    let loggedUser = API.retrieveLoggedUser();
    if (loggedUser) {
        if (!API.error) {
            eraseContent();
            UpdateHeader("Effacer la photo", "confirmDeletePhoto");
            $("#newPhotoCmd").hide();
            $("#content").append(`
                <div class="content loginForm">
                    <br>
                    <div class="form UserRow ">
                        <h4> Voulez-vous vraiment effacer cette photo? </h4>
                        <div class="UserContainer noselect">
                            <div class="UserLayout">
                                <img src="${photo.Image}" class="photoImage">
                                <span class="photoTitle"${photo.Title}/>
                            </div>
                        </div>
                    </div>           
                    <div class="form">
                        <button class="form-control btn-danger" id="deletePhotoCmd">Effacer</button>
                        <br>
                        <button class="form-control btn-secondary" id="abortDeletePhotoCmd">Annuler</button>
                    </div>
                </div>
            `);
            $("#deletePhotoCmd").on("click", function () {
                deletePhoto(photo.Id);
            });
            $("#abortDeletePhotoCmd").on("click", renderPhotos);
        } else {
            renderError("Une erreur est survenue");
        }
    }
}

function renderEditProfileForm() {
    timeout();
    let loggedUser = API.retrieveLoggedUser();
    if (loggedUser) {
        eraseContent();
        UpdateHeader("Profile", "editProfile");
        $("#newPhotoCmd").hide();
        $("#content").append(`
            <br/>
            <form class="form" id="editProfileForm"'>
                <input type="hidden" name="Id" id="Id" value="${loggedUser.Id}"/>
                <fieldset>
                    <legend>Adresse ce courriel</legend>
                    <input  type="email" 
                            class="form-control Email" 
                            name="Email" 
                            id="Email"
                            placeholder="Courriel" 
                            required 
                            RequireMessage = 'Veuillez entrer votre courriel'
                            InvalidMessage = 'Courriel invalide'
                            CustomErrorMessage ="Ce courriel est déjà utilisé"
                            value="${loggedUser.Email}" >

                    <input  class="form-control MatchedInput" 
                            type="text" 
                            matchedInputId="Email"
                            name="matchedEmail" 
                            id="matchedEmail" 
                            placeholder="Vérification" 
                            required
                            RequireMessage = 'Veuillez entrez de nouveau votre courriel'
                            InvalidMessage="Les courriels ne correspondent pas" 
                            value="${loggedUser.Email}" >
                </fieldset>
                <fieldset>
                    <legend>Mot de passe</legend>
                    <input  type="password" 
                            class="form-control" 
                            name="Password" 
                            id="Password"
                            placeholder="Mot de passe" 
                            InvalidMessage = 'Mot de passe trop court' >

                    <input  class="form-control MatchedInput" 
                            type="password" 
                            matchedInputId="Password"
                            name="matchedPassword" 
                            id="matchedPassword" 
                            placeholder="Vérification" 
                            InvalidMessage="Ne correspond pas au mot de passe" >
                </fieldset>
                <fieldset>
                    <legend>Nom</legend>
                    <input  type="text" 
                            class="form-control Alpha" 
                            name="Name" 
                            id="Name"
                            placeholder="Nom" 
                            required 
                            RequireMessage = 'Veuillez entrer votre nom'
                            InvalidMessage = 'Nom invalide'
                            value="${loggedUser.Name}" >
                </fieldset>
                <fieldset>
                    <legend>Avatar</legend>
                    <div class='imageUploader' 
                            newImage='false' 
                            controlId='Avatar' 
                            imageSrc='${loggedUser.Avatar}' 
                            waitingImage="images/Loading_icon.gif">
                </div>
                </fieldset>

                <input type='submit' name='submit' id='saveUser' value="Enregistrer" class="form-control btn-primary">
                
            </form>
            <div class="cancel">
                <button class="form-control btn-secondary" id="abortEditProfileCmd">Annuler</button>
            </div>

            <div class="cancel">
                <hr>
                <button class="form-control btn-warning" id="confirmDelelteProfileCMD">Effacer le compte</button>
            </div>
        `);
        initFormValidation(); // important do to after all html injection!
        initImageUploaders();
        addConflictValidation(API.checkConflictURL(), "Email", "saveUser");
        $("#abortEditProfileCmd").on("click", renderPhotos);
        $("#confirmDelelteProfileCMD").on("click", renderConfirmDeleteProfile);
        $("#editProfileForm").on("submit", function (event) {
            let profile = getFormData($("#editProfileForm"));
            delete profile.matchedPassword;
            delete profile.matchedEmail;
            event.preventDefault();
            showWaitingGif();
            editProfile(profile);
        });
    }
}

function renderConfirmDeleteProfile() {
    timeout();
    let loggedUser = API.retrieveLoggedUser();
    if (loggedUser) {
        eraseContent();
        UpdateHeader("Retrait de compte", "confirmDeleteProfile");
        $("#newPhotoCmd").hide();
        $("#content").append(`
            <div class="content loginForm">
                <br>
                
                <div class="form">
                 <h3> Voulez-vous vraiment effacer votre compte? </h3>
                    <button class="form-control btn-danger" id="deleteProfileCmd">Effacer mon compte</button>
                    <br>
                    <button class="form-control btn-secondary" id="cancelDeleteProfileCmd">Annuler</button>
                </div>
            </div>
        `);
        $("#deleteProfileCmd").on("click", deleteProfile);
        $("#cancelDeleteProfileCmd").on("click", renderEditProfileForm);
    }
}

function renderExpiredSession() {
    noTimeout();
    loginMessage = "Votre session est expirée. Veuillez vous reconnecter.";
    logout();
    renderLoginForm();
}

function renderLoginForm() {
    noTimeout();
    eraseContent();
    UpdateHeader("Connexion", "Login");
    $("#newPhotoCmd").hide();
    $("#content").append(`
        <div class="content" style="text-align:center">
            <div class="loginMessage">${loginMessage}</div>
            <form class="form" id="loginForm">
                <input  type='email' 
                        name='Email'
                        class="form-control"
                        required
                        RequireMessage = 'Veuillez entrer votre courriel'
                        InvalidMessage = 'Courriel invalide'
                        placeholder="adresse de courriel"
                        value='${Email}'> 
                <span style='color:red'>${EmailError}</span>
                <input  type='password' 
                        name='Password' 
                        placeholder='Mot de passe'
                        class="form-control"
                        required
                        RequireMessage = 'Veuillez entrer votre mot de passe'
                        InvalidMessage = 'Mot de passe trop court' >
                <span style='color:red'>${passwordError}</span>
                <input type='submit' name='submit' value="Entrer" class="form-control btn-primary">
            </form>
            <div class="form">
                <hr>
                <button class="form-control btn-info" id="createProfileCmd">Nouveau compte</button>
            </div>
        </div>
    `);
    initFormValidation(); // important do to after all html injection!
    $("#createProfileCmd").on("click", renderCreateProfile);
    $("#loginForm").on("submit", function (event) {
        let credential = getFormData($("#loginForm"));
        event.preventDefault();
        showWaitingGif();
        login(credential);
    });
}

function renderCreateNewPhoto() {
    eraseContent();
    UpdateHeader("Publication photo", "createPhoto");
    $("#newPhotoCmd").hide();
    $("#content").append(`
        <br/>
        <form class="form" id="createPhotoForm"'>
            <fieldset>
                <legend>Informations</legend>
                <input  type="text" 
                        class="form-control Alpha" 
                        name="Title" 
                        id="Title"
                        placeholder="Titre" 
                        required 
                        RequireMessage = 'Veuillez entrer un titre'
                        InvalidMessage = 'Titre invalide'/>
                <textarea class="form-control Alpha"
                          name="Description"
                          id="Description"
                          placeholder="Description"
                          required
                          RequireMessage = 'Veuillez entrer une description'
                          InvalidMessage = 'Description invalide'/></textarea>
                          <br/>
                <input type="checkbox"
                       name="Share"
                       id="Share">
                <label for="Share">Partagée</label>
            </fieldset>
            <fieldset>
                <legend>Image</legend>
                <div class='imageUploader' 
                        newImage='true' 
                        controlId='Image' 
                        imageSrc='images/no-avatar.png'
                        waitingImage="images/Loading_icon.gif">
            </div>
            </fieldset>
   
            <input type='submit' name='submit' id='savePhoto' value="Enregistrer" class="form-control btn-primary">
        </form>
        <div class="cancel">
            <button class="form-control btn-secondary" id="abortCreatePhotoCmd">Annuler</button>
        </div>
    `);
    initFormValidation();
    initImageUploaders();

    $("#abortCreatePhotoCmd").on("click", renderPhotos);
    $("#createPhotoForm").on("submit", function (event) {
        let loggedUser = API.retrieveLoggedUser();
        let photoData = getFormData($("#createPhotoForm"), true);
        let photo = {};
        photo['OwnerId'] = loggedUser.Id;
        photo['Title'] = photoData.Title;
        photo['Description'] = photoData.Description;
        photo['Image'] = photoData.Image;
        photo['Date'] = new Date(Date.now());
        photo["Shared"] = photoData.hasOwnProperty("Share");

        const currentDate = new Date();

        const formattedDate = currentDate.toLocaleString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        });

        const dayOfWeek = formattedDate.split(' ')[0];

        photo['Date'] = `${dayOfWeek} le ${formattedDate.slice(formattedDate.indexOf(' ') + 1)}`;
        photo["Shared"] = photoData.hasOwnProperty("Share");
        photo["Shared"] = photoData.hasOwnProperty("Share");

        event.preventDefault();
        showWaitingGif();
        createPhoto(photo);
    });
}

function getFormData(form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    console.log(form.serializeArray());
    $.each(form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

