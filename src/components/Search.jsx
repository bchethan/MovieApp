export default function Search({searchTerm, setSearchTerm}){
    return(
        <div className="search mt-5">
            <div>
                <input 
                    type="text" 
                    placeholder="Search through thousands of movies"
                    value={searchTerm}
                    onChange={(event)=> setSearchTerm(event.target.value)}
                />
            </div>
        </div>)
}