import React from 'react';
import AddFishForm from './AddFishForm';
import base from '../base';

class Inventory extends React.Component {

    constructor() {
        super();
        this.renderInventory = this.renderInventory.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.renderLogin = this.renderLogin.bind(this);
        this.authenticate = this.authenticate.bind(this);
        this.authHandler = this.authHandler.bind(this);
        this.renderLogin = this.renderLogin.bind(this);
        this.logOut = this.logOut.bind(this);
        this.state = {
            uid: null,
            owner: null
        }
    }

    componentDidMount() {
        base.onAuth((user) => {
            if (user) {
                this.authHandler(null, {user});
            }
        });
    }

    handleChange(e, key) {
        const fish = this.props.fishes[key];

        // take a copy of that fish and update with the new data
        const updatedFish = {...fish, [e.target.name]: e.target.value};
        this.props.updateFish(key, updatedFish);
    }


    logOut() {
        base.unauth();
        this.setState({ uid: null });
    }

    renderLogin() {
        return (
           <nav className="login">
               <h2>Inventory</h2>
               <button className="facebook" onClick={()=>this.authenticate('facebook')}>Login with facebook</button>
           </nav>
        )
    }

    authenticate(provider) {
        base.authWithOAuthPopup(provider, this.authHandler);
    }

    authHandler(err, authData) {
        if (err) {
            console.error(err);
            return;
        }

        // grab store info
        const storeRef = base.database().ref(this.props.storeId);

        // query the firebase once for the store data
        storeRef.once('value', (snapshot) => {
            const data = snapshot.val() || {};

            // claim if no owner
            if(!data.owner) {
                storeRef.set({
                    owner: authData.user.uid
                });
            }

            this.setState({
                uid: authData.user.uid,
                owner: data.owner || authData.user.uid
            });

        });

    }

    renderInventory(key) {
        const fish = this.props.fishes[key];

        return (
            <div className="fish-edit" key={key}>
                <input type="text" value={fish.name} name="name" onChange={(e) => this.handleChange(e, key)}/>
                <input type="text" value={fish.price} name="price" onChange={(e) => this.handleChange(e, key)}/>
                <select value={fish.status} name="status" onChange={(e) => this.handleChange(e, key)}>
                    <option value="available">Fresh</option>
                    <option value="unavailable">Sold out!</option>
                </select>
                <textarea name="desc" value={fish.desc} onChange={(e) => this.handleChange(e, key)}></textarea>
                <input type="text" value={fish.image} name="image" onChange={(e) => this.handleChange(e, key)}/>
                <button onClick={() => this.props.removeFish(key)}>Remove Fish</button>
            </div>
        )

    }

    render() {
        const logout = <button onClick={()=>this.logOut()}>Log Out!</button>

        // check if not logged in
        if(!this.state.uid) {
            return <div>{this.renderLogin()}</div>
        }

        // check if logged in is the owner
        if(this.state.uid !== this.state.owner) {
            return (
                <div>
                    <p>
                        Sorry you arent the owner
                    </p>
                    {logout}
                </div>
            )
        }

        return (
            <div>
                <h2>Inventory</h2>
                {logout}
                {Object.keys(this.props.fishes).map(this.renderInventory)}
                <AddFishForm addFish={this.props.addFish}/>
                <button onClick={this.props.loadSamples}>Load Sample Fishes</button>
            </div>

        )
    }
}

Inventory.PropTypes = {
    fishes: React.PropTypes.object.isRequired,
    updateFish: React.PropTypes.func.isRequired,
    removeFish: React.PropTypes.func.isRequired,
    addFish: React.PropTypes.func.isRequired,
    loadSamles: React.PropTypes.func.isRequired,
    storeId: React.PropTypes.string.isRequired
};

export default Inventory;