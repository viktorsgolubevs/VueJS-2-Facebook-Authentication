/*---------

 ----------
 Vue 2.X 
 ----------
 
 Realtime one page application - Authentication with Facebook @ VueJS
 
 ----------
 * Created by Viktor Golubev
 * @copyright Viktor Golubev
 * @website me@viktorsgolubevs.lv
 ----------
 
  http://vuejs.org/guide/
 
 ---------*/

let Login = Vue.extend({
    template: '#login-template',
    computed: {
        isAuthenticated () {
            return localStorage.getItem('profile')
        }
    },
    mounted () {
        if (localStorage.getItem('profile')) {
            this.$router.push({path: 'home'})
        }
    },
    methods: {
        testAPI () {
            console.log('Welcome! Fetching your information...')
            window.FB.api('/me', (response) => {
                console.log('Successful login for: ' + response.name)
                localStorage.setItem('profile', JSON.stringify(response.name))
                localStorage.setItem('token_id', response.id)
                this.$router.push({path: 'home'})
            })
        },
        // This is called with the results from from FB.getLoginStatus().
        statusChangeCallback (response) {
            console.log('statusChangeCallback', response)
            // The response object is returned with a status field that lets the
            // app know the current login status of the person.
            // Full docs on the response object can be found in the documentation
            // for FB.getLoginStatus().
            if (response.status === 'connected') {
                // Logged into your app and Facebook.
                this.testAPI()
            } else if (response.status === 'not_authorized') {
                // The person is logged into Facebook, but not your app.
                this.facebookStatus = 'Please log into this app.'
            } else {
                // The person is not logged into Facebook, so we're not sure if
                // they are logged into this app or not.
                this.facebookStatus = 'Please log into Facebook.'
            }
        },
        // This function is called when someone finishes with the Login
        // Button.
        checkLoginState () {
            window.FB.getLoginStatus((response) => {
                this.statusChangeCallback(response)
            })
        },
        handleLoginClick () {
            window.FB.login(this.checkLoginState())
        },
    }
});

/* Home page - autorized user */
let Home = Vue.extend({
    template: '#dashboard-template',
    data: function () {
        return {}
    },
    computed: {
        welcomeMessage () {
            var retrievedObject = localStorage.getItem('profile')
            return 'Welcome ' + JSON.parse(retrievedObject) + '!'
        }
    },
    methods: {
        logoutClick: function () {
            if (localStorage.getItem('profile')) {
                localStorage.removeItem('profile')
                localStorage.removeItem('token_id')
                this.$router.push({path: '/'})
            }
        }
    }
});

//------------------
// Router setup
//------------------
var router = new VueRouter({
    mode: 'hash',
    base: window.location.href,
    routes: [
        {
            path: '/',
            redirect: '/login',
        },
        {
            path: '/login',
            component: Login,
            meta: {requiresAuth: false}
        },
        {
            path: '/home',
            name: 'home',
            component: Home,
            meta: {requiresAuth: true}
        }
    ]
});

router.beforeEach((to, from, next) => {
    const authenticated = localStorage.getItem('profile')
    if (to.meta.requiresAuth && !authenticated) {
        next({
            path: '/login',
            query: {redirect: to.fullPath}
        })
    } else {
        next()
    }
})

var app = new Vue({
    el: '#app',
    router: router,
    data: {},
    created: function () {

    }
}).$mount('#app');