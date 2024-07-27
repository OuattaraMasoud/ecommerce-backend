import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreateProductDto } from './dto/create-product.dto';
import axios from 'axios';

@Injectable()
export class ProductsService {
    private sparqlEndpoint: string;

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService
    ) {
        this.sparqlEndpoint = this.configService.get<string>('SPARQL_ENDPOINT');
    }


    ///=============insert product in posgre db and rdf===========================
    async createProduct(product: CreateProductDto): Promise<string> {
        console.log("produit", product);
        try {
            const createdProduct = await this.prisma.product.create({ data: product });
            await this.insertProductToRdf(createdProduct);
            return "Product created successfully";
        } catch (error) {
            throw error;
        }
    }

    private async insertProductToRdf(product: any): Promise<void> {
        const sparqlUpdate = `
            PREFIX ex: <http://example.com#>
            INSERT DATA {
                ex:product_${product.id} a ex:Product ;
                ex:productName "${product.name}" ;
                ex:productBrand "${product.brand}" ;
                ex:subCategoryId "${product.subCategoryId}" ;
                ex:categoryId "${product.categoryId}" ;
                ex:productDescription "${product.description}" ;
                ex:productPrice ${product.price} ;
                ex:imagesUrl <${product.imagesUrl}> ;
                ex:productCreatedAt "${product.createdAt.toISOString()}" ;
                ex:productUpdatedAt "${product.updatedAt.toISOString()}" .
            }
        `;

        try {
            await axios.post(`${this.sparqlEndpoint}/products`, sparqlUpdate, {
                headers: { 'Content-Type': 'application/sparql-update' }
            });
        } catch (error) {
            console.error('Failed to insert product into RDF store:', error);
            throw error;
        }
    }

    ///================updtate product in posgre db and rdf===========================
    async updateProduct(id: string, product: CreateProductDto): Promise<string> {
        try {
            const updatedProduct = await this.prisma.product.update({
                where: { id },
                data: product,
            });
            await this.updateProductInRdf(updatedProduct);
            return "Product updated successfully";
        } catch (error) {
            throw error;
        }
    }

    private async updateProductInRdf(product: any): Promise<void> {
        const sparqlUpdate = `
            PREFIX ex: <http://example.com#>
            DELETE WHERE { ex:product_${product.id} ?p ?o };
            INSERT DATA {
                ex:product_${product.id} a ex:Product ;
                ex:productName "${product.name}" ;
                ex:productBrand "${product.productBrand}" ;
                ex:productDescription "${product.description}" ;
                ex:productPrice ${product.price} ;
                ex:imagesUrl <${product.imagesUrl}> ;
                ex:productCreatedAt "${product.createdAt.toISOString()}" ;
                ex:productUpdatedAt "${product.updatedAt.toISOString()}" .
            }
        `;

        try {
            await axios.post(`${this.sparqlEndpoint}/products`, sparqlUpdate, {
                headers: { 'Content-Type': 'application/sparql-update' }
            });
        } catch (error) {
            console.error('Failed to update product in RDF store:', error);
            throw error;
        }
    }


    ////==============delete product=============
    async deleteProduct(id: string): Promise<string> {
        try {
            await this.prisma.product.delete({ where: { id } });
            await this.deleteProductFromRdf(id);
            return "Product deleted successfully";
        } catch (error) {
            throw error;
        }
    }

    private async deleteProductFromRdf(id: string): Promise<void> {
        const sparqlUpdate = `
            PREFIX ex: <http://example.com#>
            DELETE WHERE { ex:product_${id} ?p ?o }
        `;

        try {
            await axios.post(`${this.sparqlEndpoint}/products`, sparqlUpdate, {
                headers: { 'Content-Type': 'application/sparql-update' }
            });
        } catch (error) {
            console.error('Failed to delete product from RDF store:', error);
            throw error;
        }
    }


    //=============find products by criteria=============
    async findProductsByCriteria(categoryId: string, subCategoryId: string): Promise<any> {
        try {
            const prismaProducts = await this.prisma.product.findMany({
                where: {
                    categoryId: categoryId,
                    subCategoryId: subCategoryId
                }
            });
            const rdfProducts = await this.findProductsFromRdf(categoryId, subCategoryId);
            return { prismaProducts, rdfProducts };
        } catch (error) {
            throw error;
        }
    }

    private async findProductsFromRdf(categoryId: string, subCategoryId: string,): Promise<any> {
        const sparqlQuery = `
            PREFIX ex: <http://example.com#>
            SELECT (STRAFTER(STR(?product), "#") AS ?productId) ?productBrand ?categoryId ?subCategoryId ?productName ?productDescription ?productPrice ?imagesUrl ?productCreatedAt ?productUpdatedAt
            WHERE {
                ?product a ex:Product ;
                    ex:productName ?productName ;
                    ex:productBrand ?productBrand ;
                     ex:categoryId ?categoryId ;
                     ex:subCategoryId ?subCategoryId ;
                    ex:productDescription ?productDescription ;
                    ex:productPrice ?productPrice ;
                    ex:imagesUrl ?imagesUrl ;
                    ex:productCreatedAt ?productCreatedAt ;
                    ex:productUpdatedAt ?productUpdatedAt .
                FILTER (CONTAINS(LCASE(?categoryId), "${categoryId}") && CONTAINS(LCASE(?subCategoryId), "${subCategoryId}"))
            }
        `;

        try {
            const response = await axios.post(`${this.sparqlEndpoint}/products/query`, sparqlQuery, {
                headers: { 'Content-Type': 'application/sparql-query' }
            });
            const results = response.data.results.bindings.map((binding: any) => {
                const productIdFull = binding.productId.value;
                const productId = productIdFull.replace('http://example.com#product_', ''); // Extraire la partie après 'product_'

                return {
                    productId,
                    productName: binding.productName.value,
                    categoryId: binding.categoryId.value,
                    productBrand: binding.productBrand.value,
                    subCategoryId: binding.subCategoryId.value,
                    productDescription: binding.productDescription.value,
                    productPrice: parseFloat(binding.productPrice.value),
                    imagesUrl: binding.imagesUrl.value,
                    productCreatedAt: new Date(binding.productCreatedAt.value),
                    productUpdatedAt: new Date(binding.productUpdatedAt.value),
                };
            });
            return results;
        } catch (error) {
            console.error('Failed to fetch products from RDF store:', error);
            throw error;
        }
    }
    async userFindProductsByCriteria(input: string): Promise<any> {
        try {
            const prismaProducts = await this.prisma.product.findMany({
                where: {
                    OR: [
                        {
                            description: {
                                contains: input.toLowerCase()
                            }
                        },
                        {
                            brand: {
                                contains: input.toLowerCase()
                            }
                        },
                        {
                            name: {
                                contains: input.toLowerCase()
                            }
                        },
                        // Condition pour vérifier si input est parsable en float
                        isNaN(parseFloat(input)) ? null : {
                            price: {
                                equals: parseFloat(input)
                            }
                        }
                    ].filter(Boolean) // Filtrer les conditions nulles (pour exclure les conditions non valides)
                }
            });

            const rdfProducts = await this.userFindProductsFromRdf(input);
            return { prismaProducts, rdfProducts };
        } catch (error) {
            throw error;
        }
    }

    private async userFindProductsFromRdf(input: string): Promise<any> {
        const sparqlQuery = `
            PREFIX ex: <http://example.com#>
            SELECT (STRAFTER(STR(?product), "#") AS ?productId) ?productBrand ?categoryId ?subCategoryId ?productName ?productDescription ?productPrice ?imagesUrl ?productCreatedAt ?productUpdatedAt
            WHERE {
                ?product a ex:Product ;
                    ex:productName ?productName ;
                    ex:productBrand ?productBrand ;
                     ex:categoryId ?categoryId ;
                     ex:subCategoryId ?subCategoryId ;
                    ex:productDescription ?productDescription ;
                    ex:productPrice ?productPrice ;
                    ex:imagesUrl ?imagesUrl ;
                    ex:productCreatedAt ?productCreatedAt ;
                    ex:productUpdatedAt ?productUpdatedAt .
                FILTER (CONTAINS(LCASE(?productDescription), "${input}") || CONTAINS(LCASE(?productName), "${input}") || CONTAINS(LCASE(?productBrand), "${input}") || CONTAINS(LCASE(?productPrice), "${input}"))
            }
        `;

        try {
            const response = await axios.post(`${this.sparqlEndpoint}/products/query`, sparqlQuery, {
                headers: { 'Content-Type': 'application/sparql-query' }
            });
            const results = response.data.results.bindings.map((binding: any) => {
                const productIdFull = binding.productId.value;
                const productId = productIdFull.replace('http://example.com#product_', ''); // Extraire la partie après 'product_'

                return {
                    productId,
                    productName: binding.productName.value,
                    categoryId: binding.categoryId.value,
                    productBrand: binding.productBrand.value,
                    subCategoryId: binding.subCategoryId.value,
                    productDescription: binding.productDescription.value,
                    productPrice: parseFloat(binding.productPrice.value),
                    imagesUrl: binding.imagesUrl.value,
                    productCreatedAt: new Date(binding.productCreatedAt.value),
                    productUpdatedAt: new Date(binding.productUpdatedAt.value),
                };
            });
            return results;
        } catch (error) {
            console.error('Failed to fetch products from RDF store:', error);
            throw error;
        }
    }
    async findProductsByCategory(categoryId: string): Promise<any> {
        try {
            const prismaProducts = await this.prisma.product.findMany({
                where: {

                    categoryId: categoryId
                }
            });
            const rdfProducts = await this.findProductsCategoryFromRdf(categoryId);
            return { prismaProducts, rdfProducts };
        } catch (error) {
            throw error;
        }
    }

    private async findProductsCategoryFromRdf(categoryId: string,): Promise<any> {

        const sparqlQuery = `
            PREFIX ex: <http://example.com#>
             SELECT (STRAFTER(STR(?product), "#") AS ?productId) ?productBrand ?categoryId ?subCategoryId ?productName ?productDescription ?productPrice ?imagesUrl ?productCreatedAt ?productUpdatedAt
            WHERE {
                ?product a ex:Product ;
                    ex:productName ?productName ;
                    ex:productBrand ?productBrand ;
                    ex:categoryId ?categoryId ;
                    ex:subCategoryId ?subCategoryId ;
                    ex:productDescription ?productDescription ;
                    ex:productPrice ?productPrice ;
                    ex:imagesUrl ?imagesUrl ;
                    ex:productCreatedAt ?productCreatedAt ;
                    ex:productUpdatedAt ?productUpdatedAt .
                FILTER (CONTAINS(LCASE(?categoryId), "${categoryId}"))
            }
        `;

        try {
            const response = await axios.post(`${this.sparqlEndpoint}/products/query`, sparqlQuery, {
                headers: { 'Content-Type': 'application/sparql-query' }
            });
            const results = response.data.results.bindings.map((binding: any) => {
                const productIdFull = binding.productId.value;
                const productId = productIdFull.replace('http://example.com#product_', ''); // Extraire la partie après 'product_'

                return {
                    productId,
                    productName: binding.productName.value,
                    productBrand: binding.productBrand.value,
                    categoryId: binding.categoryId.value,
                    subCategoryId: binding.subCategoryId.value,
                    productDescription: binding.productDescription.value,
                    productPrice: parseFloat(binding.productPrice.value),
                    imagesUrl: binding.imagesUrl.value,
                    productCreatedAt: new Date(binding.productCreatedAt.value),
                    productUpdatedAt: new Date(binding.productUpdatedAt.value),
                };
            });
            return results;

        } catch (error) {
            console.error('Failed to fetch products from RDF store:', error);
            throw error;
        }
    }

    //////===================find product by ID========================

    async findProductById(id: string): Promise<any> {
        try {
            const prismaProduct = await this.prisma.product.findUnique({ where: { id } });
            const rdfProduct = await this.getProductFromRdf(id);
            return { prismaProduct, rdfProduct };
        } catch (error) {
            throw error;
        }
    }

    private async getProductFromRdf(id: string): Promise<any> {
        const sparqlQuery = `
            PREFIX ex: <http://example.com#>
            SELECT ?productName ?categoryId ?productBrand ?subCategoryId ?productDescription ?productPrice ?imagesUrl ?productCreatedAt ?productUpdatedAt
            WHERE {
                ex:product_${id} a ex:Product ;
                ex:productName ?productName ;
                ex:productBrand ?productBrand ;
                ex:categoryId ?categoryId ;
                ex:subCategoryId ?subCategoryId ;
                ex:productName ?productName ;
                ex:productDescription ?productDescription ;
                ex:productPrice ?productPrice ;
                ex:imagesUrl ?imagesUrl ;
                ex:productCreatedAt ?productCreatedAt ;
                ex:productUpdatedAt ?productUpdatedAt .
            }
        `;

        try {
            const response = await axios.post(`${this.sparqlEndpoint}/query`, sparqlQuery, {
                headers: { 'Content-Type': 'application/sparql-query' }
            });
            const results = response.data.results.bindings.map((binding: any) => {
                const productIdFull = binding.productId.value;
                const productId = productIdFull.replace('http://example.com#product_', ''); // Extraire la partie après 'product_'

                return {
                    productId,
                    productName: binding.productName.value,
                    productBrand: binding.productBrand.value,
                    categoryId: binding.categoryId.value,
                    subCategoryId: binding.subCategoryId.value,
                    productDescription: binding.productDescription.value,
                    productPrice: parseFloat(binding.productPrice.value),
                    imagesUrl: binding.imagesUrl.value,
                    productCreatedAt: new Date(binding.productCreatedAt.value),
                    productUpdatedAt: new Date(binding.productUpdatedAt.value),
                };
            });
            return results;
        } catch (error) {
            console.error('Failed to fetch product from RDF store:', error);
            throw error;
        }
    }


    //====================All Products from RDF store========================
    async findAllProducts(): Promise<any> {
        try {
            // Récupérer tous les produits depuis Prisma
            const prismaProducts = await this.prisma.product.findMany();

            // Récupérer tous les produits RDF
            const rdfProducts = await this.findAllProductsFromRdf();

            return { prismaProducts, rdfProducts };
        } catch (error) {
            console.error('Failed to find all products:', error);
            throw error;
        }
    }
    private async findAllProductsFromRdf(): Promise<any> {
        // Créer la requête SPARQL pour récupérer tous les produits
        const sparqlQuery = `
             PREFIX ex: <http://example.com#>
        SELECT ?productId ?categoryId ?subCategoryId ?productBrand ?productName ?productDescription ?productPrice ?imagesUrl ?productCreatedAt ?productUpdatedAt
        WHERE {
            ?product a ex:Product ;
                ex:productName ?productName ;
                ex:categoryId ?categoryId ;
                ex:productBrand ?productBrand ;
                ex:subCategoryId ?subCategoryId ;
                ex:productDescription ?productDescription ;
                ex:productPrice ?productPrice ;
                ex:imagesUrl ?imagesUrl ;
                ex:productCreatedAt ?productCreatedAt ;
                ex:productUpdatedAt ?productUpdatedAt .
            BIND(STR(?product) AS ?productId)  # Capture the product URI as productId
        }
        `;

        try {
            // Envoyer la requête SPARQL
            const response = await axios.post(`${this.sparqlEndpoint}/products/query`, sparqlQuery, {
                headers: { 'Content-Type': 'application/sparql-query' }
            });


            console.log('==============>Fetch all products from RDF store:', response.data.results.bindings);
            // Traiter la réponse pour extraire les résultats
            const results = response.data.results.bindings.map((binding: any) => {
                const productIdFull = binding.productId.value;
                const productId = productIdFull.replace('http://example.com#product_', ''); // Extraire la partie après 'product_'

                return {
                    productId,
                    productName: binding.productName.value,
                    categoryId: binding.categoryId.value,
                    productBrand: binding.productBrand.value,
                    subCategoryId: binding.subCategoryId.value,
                    productDescription: binding.productDescription.value,
                    productPrice: parseFloat(binding.productPrice.value),
                    imagesUrl: binding.imagesUrl.value,
                    productCreatedAt: new Date(binding.productCreatedAt.value),
                    productUpdatedAt: new Date(binding.productUpdatedAt.value),
                };
            });

            return results;
        } catch (error) {
            console.error('Failed to fetch all products from RDF store:', error);
            throw error;
        }
    }
    async findRecentProducts(): Promise<any> {
        try {
            const prismaProducts = await this.prisma.product.findMany({
                take: 5, // Limite à 5 produits
                orderBy: {
                    updatedAt: 'desc' // Trie par date de création décroissante
                }
            });

            // Récupérer tous les produits RDF
            const rdfProducts = await this.findRecentProductsFromRdf();

            return { prismaProducts, rdfProducts };
        } catch (error) {
            console.error('Failed to find all products:', error);
            throw error;
        }
    }
    private async findRecentProductsFromRdf(): Promise<any> {
        // Créer la requête SPARQL pour récupérer tous les produits
        const sparqlQuery = `
        PREFIX ex: <http://example.com#>
            SELECT ?productId ?categoryId ?subCategoryId ?productBrand ?productName ?productDescription ?productPrice ?imagesUrl ?productCreatedAt ?productUpdatedAt
            WHERE {
                ?product a ex:Product ;
                    ex:productName ?productName ;
                    ex:categoryId ?categoryId ;
                    ex:productBrand ?productBrand ;
                    ex:subCategoryId ?subCategoryId ;
                    ex:productDescription ?productDescription ;
                    ex:productPrice ?productPrice ;
                    ex:imagesUrl ?imagesUrl ;
                    ex:productCreatedAt ?productCreatedAt ;
                    ex:productUpdatedAt ?productUpdatedAt .
                BIND(STR(?product) AS ?productId)  # Capture l'URI du produit en tant que productId
            }
            ORDER BY DESC(?productUpdatedAt)  # Tri par date de mise à jour décroissante
            LIMIT 5  # Limiter à 5 résultats
        `;

        try {
            // Envoyer la requête SPARQL
            const response = await axios.post(`${this.sparqlEndpoint}/products/query`, sparqlQuery, {
                headers: { 'Content-Type': 'application/sparql-query' }
            });


            console.log('==============>Fetch all products from RDF store:', response.data.results.bindings);
            // Traiter la réponse pour extraire les résultats
            const results = response.data.results.bindings.map((binding: any) => {
                const productIdFull = binding.productId.value;
                const productId = productIdFull.replace('http://example.com#product_', ''); // Extraire la partie après 'product_'

                return {
                    productId,
                    productName: binding.productName.value,
                    categoryId: binding.categoryId.value,
                    productBrand: binding.productBrand.value,
                    subCategoryId: binding.subCategoryId.value,
                    productDescription: binding.productDescription.value,
                    productPrice: parseFloat(binding.productPrice.value),
                    imagesUrl: binding.imagesUrl.value,
                    productCreatedAt: new Date(binding.productCreatedAt.value),
                    productUpdatedAt: new Date(binding.productUpdatedAt.value),
                };
            });

            return results;
        } catch (error) {
            console.error('Failed to fetch all products from RDF store:', error);
            throw error;
        }
    }


    async recommendProductsForUser(userId: string): Promise<any[]> {
        try {
            // Exemple basique : recommandation basée sur les produits les plus achetés par l'utilisateur
            console.log('==============>Recommended products for userId:', userId);

            const userPurchases = await this.prisma.purchase.findMany({
                where: {
                    userId,
                },
                include: {
                    products: true,
                },
            });
            console.log('==============>Recommended products for purchase:', userPurchases);

            // Collecter tous les produits achetés par l'utilisateur
            const purchasedProducts = userPurchases.flatMap(purchase => purchase.products);

            console.log('==============>Recommended products for purchase:', purchasedProducts);
            // Faire une recommandation simple en prenant les produits les plus populaires
            // Ici, on pourrait remplacer cela par une logique plus sophistiquée basée sur un modèle ML

            // Exemple très basique : recommander les produits les plus achetés par l'utilisateur
            const recommendedProducts = await this.prisma.product.findMany({
                where: {
                    NOT: {
                        id: {
                            in: purchasedProducts.map(product => product.id),
                        },
                    },
                },
                take: 10, // Limite de 10 produits recommandés
            });
            console.log('==============>Recommended products for user:', recommendedProducts);

            return recommendedProducts;
        } catch (error) {
            console.error('Failed to recommend products for user:', error);
            throw error;
        }
    }

}
