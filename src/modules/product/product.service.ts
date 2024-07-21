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
    async findProductsByCriteria(name: string, description: string): Promise<any> {
        try {
            const prismaProducts = await this.prisma.product.findMany({
                where: {
                    name: {
                        contains: name,
                        mode: 'insensitive', // pour une recherche insensible à la casse
                    },
                    description: {
                        contains: description,
                        mode: 'insensitive',
                    }
                }
            });
            const rdfProducts = await this.findProductsFromRdf(name);
            return { prismaProducts, rdfProducts };
        } catch (error) {
            throw error;
        }
    }

    private async findProductsFromRdf(name: string,): Promise<any> {
        const sparqlQuery = `
            PREFIX ex: <http://example.com#>
            SELECT ?productId ?productName ?productDescription ?productPrice ?imagesUrl ?productCreatedAt ?productUpdatedAt
            WHERE {
                ?product a ex:Product ;
                    ex:productName ?productName ;
                    ex:productDescription ?productDescription ;
                    ex:productPrice ?productPrice ;
                    ex:imagesUrl ?imagesUrl ;
                    ex:productCreatedAt ?productCreatedAt ;
                    ex:productUpdatedAt ?productUpdatedAt .
                FILTER (CONTAINS(LCASE(?productName), "${name.toLowerCase()}") || CONTAINS(LCASE(?productDescription), "${name.toLowerCase()}"))
            }
        `;

        try {
            const response = await axios.post(`${this.sparqlEndpoint}/products/query`, sparqlQuery, {
                headers: { 'Content-Type': 'application/sparql-query' }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch products from RDF store:', error);
            throw error;
        }
    }

    //////===================find product by ID========================

    async findProductById(id: string): Promise<any> {
        try {
            const product = await this.prisma.product.findUnique({ where: { id } });
            const rdfProduct = await this.getProductFromRdf(id);
            return { product, rdfProduct };
        } catch (error) {
            throw error;
        }
    }

    private async getProductFromRdf(id: string): Promise<any> {
        const sparqlQuery = `
            PREFIX ex: <http://example.com#>
            SELECT ?productName ?productDescription ?productPrice ?imagesUrl ?productCreatedAt ?productUpdatedAt
            WHERE {
                ex:product_${id} a ex:Product ;
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
            return response.data;
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
        SELECT ?productId ?productName ?productDescription ?productPrice ?imagesUrl ?productCreatedAt ?productUpdatedAt
        WHERE {
            ?product a ex:Product ;
                ex:productName ?productName ;
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

}
