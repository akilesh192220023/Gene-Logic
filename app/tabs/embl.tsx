import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function EmblScreen() {
  const [emblId, setEmblId] = useState('');
  const [emblResult, setEmblResult] = useState('');

  const searchEmbl = async () => {
    if (!emblId) {
      setEmblResult('Please enter a compound name or ChEMBL ID.');
      return;
    }
    setEmblResult('Searching ChEMBL...');
    try {
      let chemblId = emblId;
      // If input is not a ChEMBL ID, search by compound name first
      if (!/^CHEMBL\d+$/i.test(emblId.trim())) {
        const searchResp = await fetch(`https://www.ebi.ac.uk/chembl/api/data/molecule.json?pref_name__iexact=${encodeURIComponent(emblId.trim())}`);
        const searchData = await searchResp.json();
        if (searchData.molecules && searchData.molecules.length > 0) {
          chemblId = searchData.molecules[0].molecule_chembl_id;
        } else {
          setEmblResult('No compound found with that name.');
          return;
        }
      }
      // ChEMBL API call for compound information
      const response = await fetch(`https://www.ebi.ac.uk/chembl/api/data/molecule/${chemblId}.json`);
      console.log('ChEMBL API raw response:', response);
      if (response.ok) {
        const data = await response.json();
        console.log('ChEMBL API parsed data:', data);
        // Format compound info as clean text with additional details
        let info = '';
        if (data.molecule_chembl_id) info += `ChEMBL ID: ${data.molecule_chembl_id}\n`;
        if (data.pref_name) info += `Name: ${data.pref_name}\n`;
        if (data.molecule_type) info += `Type: ${data.molecule_type}\n`;
        if (data.max_phase) info += `Max Phase: ${data.max_phase}\n`;
        if (data.therapeutic_flag !== undefined) info += `Therapeutic: ${data.therapeutic_flag ? 'Yes' : 'No'}\n`;
        if (data.natural_product !== undefined) info += `Natural Product: ${data.natural_product ? 'Yes' : 'No'}\n`;
        if (data.oral !== undefined) info += `Oral: ${data.oral ? 'Yes' : 'No'}\n`;
        if (data.parenteral !== undefined) info += `Parenteral: ${data.parenteral ? 'Yes' : 'No'}\n`;
        if (data.polymer_flag !== undefined) info += `Polymer: ${data.polymer_flag ? 'Yes' : 'No'}\n`;
        if (data.withdrawn_flag !== undefined) info += `Withdrawn: ${data.withdrawn_flag ? 'Yes' : 'No'}\n`;
        if (data.molecule_properties) {
          if (data.molecule_properties.full_molformula) info += `Formula: ${data.molecule_properties.full_molformula}\n`;
          if (data.molecule_properties.mw_freebase) info += `Molecular Weight: ${data.molecule_properties.mw_freebase}\n`;
          if (data.molecule_properties.alogp) info += `LogP: ${data.molecule_properties.alogp}\n`;
          if (data.molecule_properties.hba) info += `HBA: ${data.molecule_properties.hba}\n`;
          if (data.molecule_properties.hbd) info += `HBD: ${data.molecule_properties.hbd}\n`;
          if (data.molecule_properties.psa) info += `PSA: ${data.molecule_properties.psa}\n`;
        }
        if (data.atc_classifications && data.atc_classifications.length > 0) {
          info += `ATC Classifications: ${data.atc_classifications.join(', ')}\n`;
        }
        if (data.structure_type) info += `Structure Type: ${data.structure_type}\n`;
        if (data.molecule_structures && data.molecule_structures.canonical_smiles) {
          info += `SMILES: ${data.molecule_structures.canonical_smiles}\n`;
        }
        if (data.molecule_structures && data.molecule_structures.standard_inchi) {
          info += `InChI: ${data.molecule_structures.standard_inchi}\n`;
        }
        if (data.molecule_structures && data.molecule_structures.standard_inchi_key) {
          info += `InChI Key: ${data.molecule_structures.standard_inchi_key}\n`;
        }
        if (data.synonyms && data.synonyms.length > 0) {
          info += `Synonyms: ${data.synonyms.map((s: any) => s.synonyms).join(', ')}\n`;
        }
        if (data.molecule_synonyms && data.molecule_synonyms.length > 0) {
          info += `Molecule Synonyms: ${data.molecule_synonyms.map((s: any) => s.molecule_synonym).join(', ')}\n`;
        }
        if (data.cross_references && data.cross_references.length > 0) {
          info += `Cross References: ${data.cross_references.map((ref: any) => ref.xref_id).join(', ')}\n`;
        }
        if (data.molecule_hierarchy) {
          if (data.molecule_hierarchy.parent_chembl_id) info += `Parent ChEMBL ID: ${data.molecule_hierarchy.parent_chembl_id}\n`;
          if (data.molecule_hierarchy.child_chembl_ids && data.molecule_hierarchy.child_chembl_ids.length > 0) {
            info += `Child ChEMBL IDs: ${data.molecule_hierarchy.child_chembl_ids.join(', ')}\n`;
          }
        }
        if (!info) info = 'No detailed information available.';
        setEmblResult(info.trim());
      } else {
        const text = await response.text();
        console.log('ChEMBL API error response:', text);
        setEmblResult('No ChEMBL information found.');
      }
    } catch (error) {
      console.log('ChEMBL API fetch error:', error);
      setEmblResult('Error communicating with ChEMBL API.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ChEMBL Compound Search</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Enter ChEMBL ID (e.g., CHEMBL25)"
          value={emblId}
          onChangeText={setEmblId}
        />
        {emblId.length > 0 && (
          <TouchableOpacity style={styles.clearIcon} onPress={() => { setEmblId(''); setEmblResult(''); }} activeOpacity={0.7}>
            <Text style={styles.clearIconText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.searchButton} onPress={searchEmbl} activeOpacity={0.8}>
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>
      <View style={{ flex: 1, width: '100%' }}>
        {emblResult ? (
          <View style={{ flex: 1 }}>
            <ScrollView style={styles.card} contentContainerStyle={{ paddingBottom: 24 }}>
              <Text style={styles.cardTitle}>Compound Information</Text>
              {emblResult.split('\n').map((line, idx) => {
                const [label, ...rest] = line.split(':');
                return (
                  <Text key={idx} style={styles.cardField}>
                    <Text style={styles.cardLabel}>{label.trim()}{rest.length ? ':' : ''}</Text>{rest.length ? rest.join(':') : ''}
                  </Text>
                )
              })}
            </ScrollView>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchButton: {
    width: '100%',
    backgroundColor: '#2a4d69',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2a4d69',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  inputWrapper: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearIcon: {
    position: 'absolute',
    right: 10,
    bottom: 6,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 2,
  },
  clearIconText: {
    fontSize: 20,
    color: '#888',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  result: {
    marginTop: 24,
    fontSize: 16,
    color: '#333',
  },
  card: {
    marginTop: 24,
    backgroundColor: '#f5f7fa',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2a4d69',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardField: {
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
  },
  cardLabel: {
    fontWeight: 'bold',
    color: '#1b2a49',
  },
});
