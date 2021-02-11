/* Devloper: Tanish Bansal (tanish.sc@gmail.com) */
const blogs = {
    blogData: {}, // contain all the posts after api call
    editPostId: '', // contain edit post ID
    isSearch: false, // flag used for search the post by title

    /* This function used when we click on the home page to show all the posts */
    homePage: () => {
        $('.new-post').addClass('hide');
        $('.home-page').removeClass('hide');
        blogs.editPostId = '';
        if (blogs.isSearch) {
            blogs.isSearch = false;
            blogs.fetchAllPosts();
        }
    },

    /* This function used to create a new post */
    createPost: () => {
        let title = $('form #title').val();
        let text = $('form #text').val();

        if(title.length && text.length) {
            blogs.ajaxRequest(blogs.editPostId, {title: title, text: text} ,"POST")
                .then(() => {
                    blogs.fetchAllPosts();
                    $('.new-post').addClass('hide');
                    $('.home-page').removeClass('hide');
                    blogs.editPostId = '';
                }).catch(data => {
                    alert(data);
                });
        } else {
            alert("Title and Text is mandatory Fields");
        }
    },

    /* This function used to Edit the post */
    editPost: (id) => {
        blogs.newPage();
        $('form #title').val($(`#${id} .card-header-title`).text().trim());
        $('form #text').val($(`#${id} .card-body`).text().trim());
        blogs.editPostId = id;
    },

    /* This function used to delete a post */
    deletePost: (id) => {
        $(`#${id} input[value=Delete]`).prop('disabled', true);
        blogs.ajaxRequest(id, {} ,"DELETE")
            .then(data => {
                alert(data.message);
                $(`#${id}`).remove();
                $(`#${id}_past_post`).remove();
            }).catch(data => {
                alert(data);
            });
    },

    /* This function used to delete all the posts */
    deletePosts: () => {
        blogs.ajaxRequest('', {} ,"DELETE")
            .then(data => {
                alert(data.message);
                $('.past-posts').html('')
                $('.current-posts-header').html('');
                blogs.editPostId = '';
                blogs.blogData = {};
                $('.generate-post').removeClass('hide');
            }).catch(data => {
                alert(data);
            });
    },

    /* This function used to generate some random posts */
    generateRandomPosts: () => {
        blogs.ajaxRequest('generateSampleData');
        alert('Data Generated Successfully');
        setTimeout(blogs.fetchAllPosts(), 1000);
        $('.generate-post').addClass('hide');
    },

    /* This function used to search the post by title ketword */
    searchByTitle: () => {
        let key = $('#site-search').val();
        $('#site-search').val('');
        if (key == "") {
            return;
        }  
        
        let searchData = blogs.blogData.filter((object) => {
            if(object.title.toLowerCase().indexOf(key.toLowerCase()) !== -1) {
                return object;
            }
        });
        if(searchData.length == 0) {
            alert('No Record Found');
            return;
        }
        blogs.renderPastPostsDetails(searchData);
        blogs.renderpastPostBlog(searchData);
        blogs.isSearch = true;
    },

    /* This is a common Ajax call function for all [GET, POST, DELETE]*/
    ajaxRequest: (url, data = {}, type = 'GET') => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `https://salesforce-blogs.herokuapp.com/blogs/api/${url}`,
                data: data,
                type: type,
                success: (data) => {
                    resolve(data);
                },
                error: () => {
                    reject("Error in Fetching the data");
                }
            });
        });
    },

    /* this function fetch the and show all the posts */
    fetchAllPosts: () => {
        blogs.ajaxRequest('')
            .then(data => {
                blogs.blogData = data;
                blogs.sortBasedOnTime();
                blogs.renderPastPostsDetails(data);
                blogs.renderpastPostBlog(data);
            })
            .catch(error => {
                alert(error);
            })
    },

    /* this function used for rendering the past posts with time */
    renderPastPostsDetails: (data) => {
        let pastPosts = "";
        for(let i=0; i<data.length; i++) {
            pastPosts += blogs.renderpastPost(data[i]);
        }
        $('.past-posts').html(pastPosts);
    },

    /* This function render all the posts */
    renderpastPostBlog: (data) => {
        let pastBlogs = "";
        for(let i=0; i<data.length; i++) {
            pastBlogs += blogs.renderpastPostBlogView(data[i]);
        }
        $('.current-posts-header').html(pastBlogs);
    },

    /* ==== These functions used as helping functions ==== */
    renderpastPost: (blog) => {
        return `<div id=${blog.id}_past_post class="card">
            <span> <b> ${blogs.getBlogTime(blog.timestamp)} </b></span> - 
            <span> ${blog.title} </span>
        </div>`;
    },

    renderpastPostBlogView: (blog) => {
        return `<div class="card" id="${blog.id}">
            <div class="card-header">
                <span class="card-header-title"> ${blog.title} </span>
                <span class="card-header-time"><b> ${blogs.getBlogTime(blog.timestamp)} </b></span>
            </div>
            <div class="card-body"><p> ${blog.text} </p></div>
            <div class="card-bottom">        
                <input type="button" class="edit-button" value="Edit" onclick="blogs.editPost(${blog.id})">  
                <input type="button" value="Delete" onclick="blogs.deletePost(${blog.id})">
            </div>
        </div>`;
    },

    newPage: () => {
        $('.new-post').removeClass('hide');
        $('.home-page').addClass('hide');
        $('form #title').val('');
        $('form #text').val('');
    },

    /* this function sort the posts on the basis of timestamp */
    sortBasedOnTime: () => {
        return blogs.blogData.sort(
            (obj1, obj2) =>  new Date(obj1.timestamp).getTime() - new Date(obj2.timestamp).getTime()
        );
    },

    getBlogTime: (time) => {
        const month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const date = new Date(time);
        return `${date.getDate()} ${month_names_short[date.getMonth()]} ${date.getFullYear()}`;
    }
};

/* Self invoke function call the method fetchallpost once and render the home page */
(() => {
    blogs.fetchAllPosts();
})();