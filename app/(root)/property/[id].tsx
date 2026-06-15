import { useSavedProperty } from "@/hooks/useSavedProperty";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import { Property } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [updating, setUpdating] = useState(false);
  const { isSaved, saveLoading, toggleSave } = useSavedProperty(id);
  const { width: screenWidth } = Dimensions.get('window');

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    if (!id) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching property:", error);
    } else {
      setProperty(data);
    }
    setLoading(false);
  };

  const handleMarkSold = async () => {
    if (!property) return;
    
    Alert.alert(
      "Mark as Sold",
      "Are you sure you want to mark this property as sold?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Sold",
          style: "destructive",
          onPress: async () => {
            setUpdating(true);
            const { error } = await supabase
              .from("properties")
              .update({ is_sold: true })
              .eq("id", property.id);

            if (error) {
              Alert.alert("Error", "Failed to mark property as sold");
              console.error(error);
            } else {
              setProperty({ ...property, is_sold: true });
              Alert.alert("Success", "Property marked as sold");
            }
            setUpdating(false);
          },
        },
      ]
    );
  };

  const handleDeleteProperty = async () => {
    if (!property) return;
    
    Alert.alert(
      "Delete Property",
      "Are you sure you want to delete this property? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setUpdating(true);
            
            // First delete related saved_properties
            const { error: savedError } = await supabase
              .from("saved_properties")
              .delete()
              .eq("property_id", property.id);
            
            if (savedError) {
              console.error("Error deleting saved properties:", savedError);
            }
            
            // Then delete the property
            const { error } = await supabase
              .from("properties")
              .delete()
              .eq("id", property.id);

            if (error) {
              Alert.alert("Error", `Failed to delete property: ${error.message}`);
              console.error(error);
            } else {
              Alert.alert("Success", "Property deleted successfully");
              router.back();
            }
            setUpdating(false);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Property not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Image Gallery */}
        <View className="relative" style={{ height: 300 }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              setCurrentImageIndex(index);
            }}
          >
            {property.images.map((imageUrl, index) => (
              <Image
                key={index}
                source={{ uri: imageUrl }}
                style={{ width: screenWidth, height: 300 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 w-10 h-10 bg-white/90 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>

          {/* Save/Heart Button */}
          <TouchableOpacity
            onPress={toggleSave}
            disabled={saveLoading}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full items-center justify-center"
          >
            {saveLoading ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Ionicons
                name={isSaved ? "heart" : "heart-outline"}
                size={20}
                color={isSaved ? "#EF4444" : "#111827"}
              />
            )}
          </TouchableOpacity>

          {/* Image Dots */}
          {property.images.length > 1 && (
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
              {property.images.map((_, index) => (
                <View
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </View>
          )}

          {/* Sold Badge */}
          {property.is_sold && (
            <View className="absolute bottom-4 right-4 bg-red-500 px-4 py-2 rounded-full">
              <Text className="text-white text-sm font-semibold">Sold</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View className="p-5">
          {/* Title & Price */}
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900 mb-1">
                {property.title}
              </Text>
              <View className="flex-row items-center gap-1">
                <Ionicons name="location-outline" size={16} color="#6B7280" />
                <Text className="text-gray-500">{property.address}</Text>
              </View>
            </View>
            <Text className="text-blue-600 font-bold text-xl">
              {formatPrice(property.price)}
            </Text>
          </View>

          {/* Type Badge */}
          <View className="self-start bg-blue-50 px-3 py-1 rounded-full mb-4">
            <Text className="text-blue-700 text-sm font-semibold capitalize">
              {property.type}
            </Text>
          </View>

          {/* Stats */}
          <View className="flex-row gap-6 mb-6">
            <View className="flex-1 bg-gray-50 rounded-2xl p-4">
              <Ionicons name="bed-outline" size={24} color="#3B82F6" />
              <Text className="text-gray-900 font-bold text-lg mt-2">
                {property.bedrooms}
              </Text>
              <Text className="text-gray-500 text-sm">Bedrooms</Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-2xl p-4">
              <Ionicons name="water-outline" size={24} color="#3B82F6" />
              <Text className="text-gray-900 font-bold text-lg mt-2">
                {property.bathrooms}
              </Text>
              <Text className="text-gray-500 text-sm">Bathrooms</Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-2xl p-4">
              <Ionicons name="expand-outline" size={24} color="#3B82F6" />
              <Text className="text-gray-900 font-bold text-lg mt-2">
                {property.area_sqft}
              </Text>
              <Text className="text-gray-500 text-sm">Sq Ft</Text>
            </View>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-2">
              Description
            </Text>
            <Text className="text-gray-600 leading-relaxed">
              {property.description}
            </Text>
          </View>

          {/* Map */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-2">
              Location
            </Text>
            <View className="rounded-2xl overflow-hidden" style={{ height: 200 }}>
              <WebView
                source={{
                  uri: `https://www.openstreetmap.org/export/embed.html?bbox=${
                    property.longitude - 0.002
                  }%2C${
                    property.latitude - 0.002
                  }%2C${
                    property.longitude + 0.002
                  }%2C${
                    property.latitude + 0.002
                  }&layer=mapnik&marker=${property.latitude}%2C${property.longitude}`,
                }}
                style={{ flex: 1 }}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleMarkSold}
              disabled={updating || property.is_sold}
              className={`flex-1 py-4 rounded-2xl items-center ${
                property.is_sold
                  ? "bg-gray-100"
                  : "bg-orange-50 border border-orange-200"
              }`}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#F97316" />
              ) : (
                <Text
                  className={`font-semibold ${
                    property.is_sold ? "text-gray-400" : "text-orange-600"
                  }`}
                >
                  {property.is_sold ? "Already Sold" : "Mark Sold"}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteProperty}
              disabled={updating}
              className="flex-1 bg-red-50 border border-red-200 py-4 rounded-2xl items-center"
            >
              {updating ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Text className="text-red-600 font-semibold">Delete Property</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}