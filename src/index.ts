import express, { Request, Response } from "express";
import path from "path";


const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "/views"));

// Página inicial com a lista de Pokémon
app.get('/', async (req: Request, res: Response) => {
    try {
        const allPokemon = await fetchAllPokemon(1025); // Obtendo 1025 Pokémon
        const detailedPokemonPromises = allPokemon.map(async (pokemon: any) => {
            const details = await fetchPokemonDetails(pokemon.name);
            return { ...pokemon, details };
        });
        const detailedPokemon = await Promise.all(detailedPokemonPromises);
        res.render("index", { results: detailedPokemon }); // Enviando `results` para a view
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro ao buscar Pokémon");
    }
});

// Página de detalhes do Pokémon
app.get('/pokemon/:name', async (req: Request, res: Response) => {
    try {
        const pokemonDetails = await fetchPokemonDetails(req.params.name);
        if (!pokemonDetails) {
            res.status(404).send("Pokémon não encontrado");
            return;
        }
        res.render("pokemon", { pokemon: pokemonDetails }); // Enviando `pokemon` para a view
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro ao buscar detalhes do Pokémon");
    }
});

// Função para buscar todos os Pokémon
async function fetchAllPokemon(limit: number = 100, offset: number = 0) {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Erro na requisição: ${res.status}`);
        }
        const data = await res.json();
        return data.results || [];
    } catch (error) {
        console.error("Erro ao buscar Pokémon:", error);
        return [];
    }
}

// Função para buscar detalhes de um Pokémon
async function fetchPokemonDetails(name: string) {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if (!res.ok) {
            throw new Error(`Erro na requisição: ${res.status}`);
        }
        const data = await res.json();
        return {
            id: data.id,
            name: data.name,
            types: data.types.map((type: any) => type.type.name),
            abilities: data.abilities.map((ability: any) => ability.ability.name),
        };
    } catch (error) {
        console.error("Erro ao buscar detalhes do Pokémon:", error);
        return null;
    }
}

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
