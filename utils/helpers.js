//tranucate
const tranucatePost = post => {
    if(post.length > 100){
        return post.substring(0,100) + "...";
    }
    return post;
};

module.exports = tranucatePost;