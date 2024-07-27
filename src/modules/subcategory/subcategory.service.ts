


import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';

@Injectable()
export class SubCategoriesService {
    private sparqlEndpoint: string;

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService
    ) {
        this.sparqlEndpoint = this.configService.get<string>('SPARQL_ENDPOINT');
    }


    ///=============insert subCategory in posgre db and rdf===========================
    async createSubCategory(subCategory: CreateSubCategoryDto): Promise<string> {

        try {
            const createdSubCategory = await this.prisma.subCategory.create({ data: subCategory });
            console.log("sous categorie", createdSubCategory);
            await this.insertSubCategoryToRdf(createdSubCategory);
            return "subCategory created successfully";
        } catch (error) {
            throw error;
        }
    }

    private async insertSubCategoryToRdf(subCategory: any): Promise<void> {
        const sparqlUpdate = `
            PREFIX ex: <http://example.com#>
            INSERT DATA {
                ex:subCategory_${subCategory.id} a ex:SubCategory ;
                ex:subCategoryName "${subCategory.name}" ;
                ex:subCategoryCreatedAt "${subCategory.createdAt.toISOString()}" ;
                ex:subCategoryUpdatedAt "${subCategory.updatedAt.toISOString()}" .
            }
        `;

        try {
            await axios.post(`${this.sparqlEndpoint}/subcategories`, sparqlUpdate, {
                headers: { 'Content-Type': 'application/sparql-update' }
            });
        } catch (error) {
            console.error('Failed to insert subCategory into RDF store:', error);
            throw error;
        }
    }

    ///================updtate subCategory in posgre db and rdf===========================
    async updateSubCategory(id: string, product: CreateSubCategoryDto): Promise<string> {
        try {
            const updatedProduct = await this.prisma.subCategory.update({
                where: { id },
                data: product,
            });
            await this.updateSubCategoryInRdf(updatedProduct);
            return "Product updated successfully";
        } catch (error) {
            throw error;
        }
    }

    private async updateSubCategoryInRdf(subCategory: any): Promise<void> {
        const sparqlUpdate = `
            PREFIX ex: <http://example.com#>
            DELETE WHERE { ex:subCategory_${subCategory.id} ?p ?o };
            INSERT DATA {
                ex:subCategory_${subCategory.id} a ex:SubCategory ;
                ex:subCategoryName "${subCategory.name}" ;
                ex:subCategoryCreatedAt "${subCategory.createdAt.toISOString()}" ;
                ex:subCategoryUpdatedAt "${subCategory.updatedAt.toISOString()}" .
            }
        `;

        try {
            await axios.post(`${this.sparqlEndpoint}/update`, sparqlUpdate, {
                headers: { 'Content-Type': 'application/sparql-update' }
            });
        } catch (error) {
            console.error('Failed to update subCategory in RDF store:', error);
            throw error;
        }
    }


    ////==============delete subCategory=============
    async deleteSubCategory(id: string): Promise<string> {
        try {
            await this.prisma.subCategory.delete({ where: { id } });
            await this.deleteSubCategoryFromRdf(id);
            return "subCategory deleted successfully";
        } catch (error) {
            throw error;
        }
    }

    private async deleteSubCategoryFromRdf(id: string): Promise<void> {
        const sparqlUpdate = `
            PREFIX ex: <http://example.com#>
            DELETE WHERE { ex:subCategory_${id} ?p ?o }
        `;

        try {
            await axios.post(`${this.sparqlEndpoint}/update`, sparqlUpdate, {
                headers: { 'Content-Type': 'application/sparql-update' }
            });
        } catch (error) {
            console.error('Failed to delete subCategory from RDF store:', error);
            throw error;
        }
    }


    //=============find products by criteria=============
    async findSubCategoriesByCriteria(name: string, description: string): Promise<any> {
        try {
            const prismaSubCategories = await this.prisma.subCategory.findMany({
                where: {
                    name: {
                        contains: name,
                        mode: 'insensitive', // pour une recherche insensible à la casse
                    },

                }
            });
            const rdfSubCategories = await this.findSubCategoriesFromRdf(name);
            return { prismaSubCategories, rdfSubCategories };
        } catch (error) {
            throw error;
        }
    }

    private async findSubCategoriesFromRdf(string: string): Promise<any> {
        const sparqlQuery = `
            PREFIX ex: <http://example.com#>
            SELECT ?subCategoryId ?subCategoryName ?subCategoryCreatedAt ?subCategoryUpdatedAt
            WHERE {
                ?product a ex:Product ;
                    ex:subCategoryName ?subCategoryName ;
                    ex:subCategoryCreatedAt ?subCategoryCreatedAt ;
                    ex:subCategoryUpdatedAt ?subCategoryUpdatedAt .
                FILTER (CONTAINS(LCASE(subCategoryName), "${string.toLowerCase()}"))
            }
        `;

        try {
            const response = await axios.post(`${this.sparqlEndpoint}/query`, sparqlQuery, {
                headers: { 'Content-Type': 'application/sparql-query' }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch subCategory from RDF store:', error);
            throw error;
        }
    }

    //////===================find product by ID========================

    async findProductById(id: string): Promise<any> {
        try {
            const product = await this.prisma.subCategory.findUnique({ where: { id } });
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


    //====================All SubCategory from RDF store========================
    async findAllSubCategory(): Promise<any> {
        try {
            // Récupérer tous les sous categories depuis Prisma
            const prismaSubCategories = await this.prisma.subCategory.findMany();

            // Récupérer tous les sous categories RDF
            const rdfSubCategories = await this.findAllSubCategoryFromRdf();

            return { prismaSubCategories, rdfSubCategories };
        } catch (error) {
            console.error('Failed to find all products:', error);
            throw error;
        }
    }
    private async findAllSubCategoryFromRdf(): Promise<any> {
        // Créer la requête SPARQL pour récupérer tous les sous categories
        const sparqlQuery = `
                PREFIX ex: <http://example.com#>
SELECT (STRAFTER(STR(?subCategory), "#") AS ?subCategoryId)
       ?subCategoryName
       ?subCategoryCreatedAt
       ?subCategoryUpdatedAt
      
WHERE {
  # Récupérer les sous catégories
  ?subCategory a ex:SubCategory ;
            ex:subCategoryName ?subCategoryName ;
            ex:subCategoryCreatedAt ?subCategoryCreatedAt ;
            ex:subCategoryUpdatedAt ?subCategoryUpdatedAt .
}
        `;

        try {
            // Envoyer la requête SPARQL
            const response = await axios.post(`${this.sparqlEndpoint}/subcategories/query`, sparqlQuery, {
                headers: { 'Content-Type': 'application/sparql-query' }
            });


            console.log('==============>Fetch all subCategory from RDF store:', response.data.results.bindings);
            const results = response.data.results.bindings.map((binding: any) => {
                const productIdFull = binding.subCategoryId.value;
                const subCategoryId = productIdFull.replace('http://example.com#subCategory_', '');

                return {
                    subCategoryId,
                    subCategoryName: binding.subCategoryName.value,
                    subCategoryCreatedAt: new Date(binding.subCategoryCreatedAt.value),
                    subCategoryUpdatedAt: new Date(binding.subCategoryUpdatedAt.value),
                };
            });

            return results;
        } catch (error) {
            console.error('Failed to fetch all subCategories from RDF store:', error);
            throw error;
        }
    }

}
